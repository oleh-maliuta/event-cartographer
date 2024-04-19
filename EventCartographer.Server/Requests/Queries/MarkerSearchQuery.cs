using Microsoft.AspNetCore.Mvc;

namespace EventCartographer.Server.Requests.Queries
{
    public class MarkerSearchQuery
    {
        [FromQuery(Name = "format")]
        public string? Format { get; set; }
        [FromQuery(Name = "q")]
        public string? Search { get; set; }
        [FromQuery(Name = "sort_type")]
        public string? SortType { get; set; }
        [FromQuery(Name = "sort_by_asc")]
        public bool? SortByAsc { get; set; }
        [FromQuery(Name = "imp")]
        public string[]? Importance { get; set; }
        [FromQuery(Name = "min_time")]
        public DateTime? MinTime { get; set; }
        [FromQuery(Name = "max_time")]
        public DateTime? MaxTime { get; set; }
    }
}
