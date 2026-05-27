using System.Text.Json;

namespace Schedule.Web.Services;

public sealed class TimetableSuggestionsService(HttpClient httpClient) : ITimetableSuggestionsService
{
    private const string TimetableBaseUrl = "https://dekanat.nung.edu.ua/cgi-bin/timetable.cgi";

    public async Task<IReadOnlyList<string>> GetSuggestionsAsync(
        int level,
        int facultyId,
        int course = 0,
        string? query = null,
        CancellationToken cancellationToken = default)
    {
        if (facultyId <= 0)
        {
            throw new ArgumentException("Faculty ID must be positive.", nameof(facultyId));
        }

        if (level is not (141 or 142))
        {
            throw new ArgumentException("level must be 141 (teachers) or 142 (groups).", nameof(level));
        }

        string url = $"{TimetableBaseUrl}?n=701&lev={level}&faculty={facultyId}";
        if (course > 0)
        {
            url += $"&course={course}";
        }

        if (!string.IsNullOrWhiteSpace(query))
        {
            url += $"&query={Uri.EscapeDataString(query)}";
        }

        string json = await httpClient.GetStringAsync(url, cancellationToken);
        SuggestionsResponse? response = JsonSerializer.Deserialize<SuggestionsResponse>(json);
        return response?.Suggestions ?? [];
    }
}
