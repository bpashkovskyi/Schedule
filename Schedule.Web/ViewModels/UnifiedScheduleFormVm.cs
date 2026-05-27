namespace Schedule.Web.ViewModels;

public sealed class UnifiedScheduleFormVm : DateRangeFormVm
{
    public string? FacultyName { get; set; }
    public int Course { get; set; }
    public string? TeacherId { get; set; }
    public string? GroupId { get; set; }
    public ScheduleResultVm? Result { get; set; }
    public IReadOnlyList<ScheduleEntityVm> AvailableTeachers { get; set; } = [];
    public IReadOnlyList<ScheduleEntityVm> AvailableGroups { get; set; } = [];
}
