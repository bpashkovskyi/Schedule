using Schedule.Web.ViewModels;

namespace Schedule.Web.Services;

public interface IAuditoriumLoadService
{
    Task<AuditoriumLoadResultVm> CalculateAsync(
        ReferenceDataVm reference,
        string? blockName,
        DateOnly fromDate,
        DateOnly toDate,
        int pairsFrom,
        int pairsTo,
        CancellationToken cancellationToken = default);
}
