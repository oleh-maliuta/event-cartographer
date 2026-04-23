using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Requests.Queries
{
    public class PageQuery
    {
        [FromQuery(Name = "page")]
        [Range(1, int.MaxValue)]
        public int Page { get; set; } = 1;
        [FromQuery(Name = "page_size")]
        [Range(1, 100)]
        public int PageSize { get; set; } = 10;
    }
}
