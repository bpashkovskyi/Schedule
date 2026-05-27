namespace Schedule.Web.ViewModels;

public sealed class WeekScheduleVm
{
    public required int WeekNumber { get; init; }
    public required string StartDate { get; init; }
    public required string EndDate { get; init; }
    public required IReadOnlyList<DayScheduleVm> Days { get; init; }
}
