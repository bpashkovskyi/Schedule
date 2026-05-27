namespace Schedule.Web.Services;

public interface ITimetableSuggestionsService
{
    Task<IReadOnlyList<string>> GetSuggestionsAsync(
        int level,
        int facultyId,
        int course = 0,
        string? query = null,
        CancellationToken cancellationToken = default);
}
