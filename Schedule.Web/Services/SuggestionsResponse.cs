using System.Text.Json.Serialization;

namespace Schedule.Web.Services;

internal sealed class SuggestionsResponse
{
    [JsonPropertyName("suggestions")]
    public List<string>? Suggestions { get; init; }
}
