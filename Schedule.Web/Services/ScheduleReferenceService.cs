using Dekanat.ScheduleSdk;
using Dekanat.ScheduleSdk.Enums;
using Dekanat.ScheduleSdk.Models;
using Dekanat.ScheduleSdk.Requests;
using Schedule.Web.ViewModels;

namespace Schedule.Web.Services;

public sealed class ScheduleReferenceService(IPsRozkladClient client) : IScheduleReferenceService
{
    public async Task<ReferenceDataVm> LoadReferenceDataAsync(CancellationToken cancellationToken = default)
    {
        Task<PsRozkladExport> roomsTask = client.GetObjectListAsync(new ObjectListRequest
        {
            Mode = RequestMode.Room,
            IncludeIds = true,
        }, cancellationToken);

        Task<PsRozkladExport> teachersTask = client.GetObjectListAsync(new ObjectListRequest
        {
            Mode = RequestMode.Teacher,
            IncludeIds = true,
        }, cancellationToken);

        Task<PsRozkladExport> groupsTask = client.GetObjectListAsync(new ObjectListRequest
        {
            Mode = RequestMode.Group,
            IncludeIds = true,
        }, cancellationToken);

        await Task.WhenAll(roomsTask, teachersTask, groupsTask);

        return new ReferenceDataVm
        {
            Blocks = MapBuildings(await roomsTask),
            TeacherDepartments = MapDepartments(await teachersTask),
            GroupDepartments = MapDepartments(await groupsTask),
        };
    }

    private static IReadOnlyList<BuildingVm> MapBuildings(PsRozkladExport export) =>
        (export.Blocks ?? [])
            .Where(b => b.Objects is { Count: > 0 })
            .Select(b => new BuildingVm
            {
                Name = b.Name ?? string.Empty,
                Rooms = MapEntities(b.Objects),
            })
            .ToList();

    private static IReadOnlyList<DepartmentVm> MapDepartments(PsRozkladExport export) =>
        (export.Departments ?? [])
            .Where(d => d.Objects is { Count: > 0 })
            .Select(d => new DepartmentVm
            {
                Name = d.Name ?? string.Empty,
                Entities = MapEntities(d.Objects),
            })
            .ToList();

    private static IReadOnlyList<ScheduleEntityVm> MapEntities(IReadOnlyList<ScheduleEntity>? entities) =>
        (entities ?? [])
            .Select(e => new ScheduleEntityVm
            {
                Id = e.Id ?? string.Empty,
                Name = e.Name ?? string.Empty,
                LastName = e.LastName,
                FirstName = e.FirstName,
                Patronymic = e.Patronymic,
                FullName = BuildTeacherFullName(e),
            })
            .ToList();

    internal static string BuildTeacherFullName(ScheduleEntity entity)
    {
        if (!string.IsNullOrWhiteSpace(entity.LastName))
        {
            return $"{entity.LastName} {entity.FirstName} {entity.Patronymic}".Replace("  ", " ").Trim();
        }

        return entity.Name ?? string.Empty;
    }
}
