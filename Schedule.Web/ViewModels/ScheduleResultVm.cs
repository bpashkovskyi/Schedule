namespace Schedule.Web.ViewModels;

public sealed class ScheduleResultVm
{
    public required string Title { get; init; }
    public bool IsWeeklyView { get; init; }
    public string? ExportUrl { get; init; }
    public IReadOnlyDictionary<string, IReadOnlyList<ScheduleItemVm>>? GroupedByDate { get; init; }
    public IReadOnlyList<WeekScheduleVm>? Weeks { get; init; }
    public bool HasItems =>
        (GroupedByDate?.Count > 0) || (Weeks?.Count > 0);
}
