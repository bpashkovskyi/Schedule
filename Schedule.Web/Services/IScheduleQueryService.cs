using Dekanat.ScheduleSdk.Enums;
using Dekanat.ScheduleSdk.Models;

namespace Schedule.Web.Services;

public interface IScheduleQueryService
{
    Task<PsRozkladExport> GetScheduleAsync(
        RequestMode mode,
        string objectId,
        DateOnly beginDate,
        DateOnly endDate,
        CancellationToken cancellationToken = default);

    string BuildExportUrl(RequestMode mode, string objectId, DateOnly beginDate, DateOnly endDate);
}
