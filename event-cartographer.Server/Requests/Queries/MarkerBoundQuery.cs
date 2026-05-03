using Microsoft.AspNetCore.Mvc;

namespace EventCartographer.Server.Requests.Queries
{
    public class MarkerBoundQuery
    {
        [FromQuery(Name = "n_e_lat")]
        public decimal? NorthEastLatitude { get; set; }
        [FromQuery(Name = "n_e_long")]
        public decimal? NorthEastLongitude { get; set; }
        [FromQuery(Name = "s_w_lat")]
        public decimal? SouthWestLatitude { get; set; }
        [FromQuery(Name = "s_w_long")]
        public decimal? SouthWestLongitude { get; set; }
    }
}
