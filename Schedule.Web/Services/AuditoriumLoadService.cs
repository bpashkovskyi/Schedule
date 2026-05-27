using Dekanat.ScheduleSdk.Enums;
using Dekanat.ScheduleSdk.Models;
using Schedule.Web.ViewModels;

namespace Schedule.Web.Services;

public sealed class AuditoriumLoadService(IScheduleQueryService scheduleQuery) : IAuditoriumLoadService
{
    private const int Concurrency = 4;

    public async Task<AuditoriumLoadResultVm> CalculateAsync(
        ReferenceDataVm reference,
        string? blockName,
        DateOnly fromDate,
        DateOnly toDate,
        int pairsFrom,
        int pairsTo,
        CancellationToken cancellationToken = default)
    {
        IReadOnlyList<BuildingVm> selectedBlocks = GetSelectedBlocks(reference, blockName);
        int workingDays = ScheduleDisplayService.CountWorkingDays(fromDate, toDate);
        int pairCount = pairsTo - pairsFrom + 1;
        int possiblePairs = workingDays * pairCount;

        List<RoomLoadTarget> rooms = selectedBlocks
            .SelectMany(b => b.Rooms.Select(r => new RoomLoadTarget(r.Id, r.Name, b.Name)))
            .DistinctBy(r => r.RoomId)
            .ToList();

        List<AuditoriumLoadItemVm> results = new(rooms.Count);
        int errorCount = 0;
        int index = 0;

        async Task WorkerAsync()
        {
            while (true)
            {
                int current = Interlocked.Increment(ref index) - 1;
                if (current >= rooms.Count)
                {
                    return;
                }

                RoomLoadTarget room = rooms[current];
                try
                {
                    PsRozkladExport export = await scheduleQuery.GetScheduleAsync(
                        RequestMode.Room,
                        room.RoomId,
                        fromDate,
                        toDate,
                        cancellationToken);

                    int actualPairs = ScheduleDisplayService.CountActualPairs(
                        export.ScheduleItems,
                        pairsFrom,
                        pairsTo);

                    double percent = possiblePairs > 0 ? actualPairs * 100.0 / possiblePairs : 0;
                    lock (results)
                    {
                        results.Add(new AuditoriumLoadItemVm
                        {
                            RoomName = room.RoomName,
                            BlockName = room.BlockName,
                            Percent = percent,
                            ActualPairs = actualPairs,
                            PossiblePairs = possiblePairs,
                        });
                    }
                }
                catch
                {
                    Interlocked.Increment(ref errorCount);
                    lock (results)
                    {
                        results.Add(new AuditoriumLoadItemVm
                        {
                            RoomName = room.RoomName,
                            BlockName = room.BlockName,
                            Percent = 0,
                            ActualPairs = 0,
                            PossiblePairs = possiblePairs,
                        });
                    }
                }
            }
        }

        Task[] workers = Enumerable.Range(0, Concurrency).Select(_ => WorkerAsync()).ToArray();
        await Task.WhenAll(workers);

        return new AuditoriumLoadResultVm
        {
            Items = results.OrderByDescending(r => r.Percent).ToList(),
            ErrorCount = errorCount,
            WorkingDays = workingDays,
            PossiblePairsPerRoom = possiblePairs,
        };
    }

    private static IReadOnlyList<BuildingVm> GetSelectedBlocks(ReferenceDataVm reference, string? blockName)
    {
        if (!string.IsNullOrWhiteSpace(blockName))
        {
            BuildingVm? block = reference.Blocks.FirstOrDefault(b => b.Name == blockName);
            return block is null ? [] : [block];
        }

        return reference.Blocks;
    }

}
