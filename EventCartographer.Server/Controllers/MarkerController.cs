using EventCartographer.Server.Responses;
using EventCartographer.Server.Models;
using EventCartographer.Server.Requests;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using EventCartographer.Server.Requests.Queries;
using EventCartographer.Server.Services.MongoDB;

namespace EventCartographer.Server.Controllers
{
    [ApiController]
    [Route("api/markers")]
    public class MarkerController : BaseController
    {
        public MarkerController(MongoDbService service) : base(service) { }

        [HttpPost]
        public async Task<IActionResult> AddMarker(AddMarkerRequest request)
        {
            if (User?.Identity?.IsAuthenticated != true)
            {
                return Unauthorized(new BaseResponse.ErrorResponse("Unauthorized!"));
            }

            string[] importanceArray = ["low", "medium", "high"];

            if (!importanceArray.Contains(request.Importance))
            {
                return BadRequest(new BaseResponse.ErrorResponse("Invalid importance value!"));
            }

            string userId = AuthorizedUserId;

            Marker marker = new()
            {
                UserId = userId,
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                Title = request.Title,
                Description = request.Description,
                Importance = request.Importance,
                StartsAt = request.StartsAt
            };

            await DB.Markers.InsertOneAsync(marker);

            return Ok(new MarkerResponse(marker));
        }

        [HttpPut("{markerId}")]
        public async Task<IActionResult> UpdateMarker(string markerId, UpdateMarkerRequest request)
        {
            if (User?.Identity?.IsAuthenticated != true)
            {
                return Unauthorized(new BaseResponse.ErrorResponse("Unauthorized!"));
            }

            string[] importanceArray = ["low", "medium", "high"];
            Marker? marker = await DB.Markers.Find(x => x.Id == markerId).FirstOrDefaultAsync();

            if (marker == null)
            {
                return NotFound(new BaseResponse.ErrorResponse("Marker not found!"));
            }

            if (marker.UserId != AuthorizedUserId)
            {
                return BadRequest(new BaseResponse.ErrorResponse("The user is not the owner of the marker"));
            }

            if (!importanceArray.Contains(request.Importance))
            {
                return BadRequest(new BaseResponse.ErrorResponse("Invalid importance value!"));
            }

            marker.Latitude = request.Latitude;
            marker.Longitude = request.Longitude;
            marker.Title = request.Title;
            marker.Description = request.Description;
            marker.Importance = request.Importance;
            marker.StartsAt = request.StartsAt;

            await DB.Markers.ReplaceOneAsync(x => x.Id == markerId, marker);

            return Ok(new MarkerResponse(marker));
        }

        [HttpDelete("{markerId}")]
        public async Task<IActionResult> DeleteMarker(string markerId)
        {
            if (User?.Identity?.IsAuthenticated != true)
            {
                return Unauthorized(new BaseResponse.ErrorResponse("Unauthorized!"));
            }

            Marker? marker = await DB.Markers.Find(x => x.Id == markerId).FirstOrDefaultAsync();

            if (marker == null)
            {
                return NotFound(new BaseResponse.ErrorResponse("Marker not found!"));
            }

            if (marker.UserId != AuthorizedUserId)
            {
                return BadRequest(new BaseResponse.ErrorResponse("The user is not the owner of the marker"));
            }

            await DB.Markers.DeleteOneAsync(x => x.Id == markerId);

            return Ok(new MarkerResponse(marker));
        }

        [HttpGet("{markerId}")]
        public async Task<IActionResult> GetMarker(string markerId)
        {
            if (User?.Identity?.IsAuthenticated != true)
            {
                return Unauthorized(new BaseResponse.ErrorResponse("Unauthorized!"));
            }

            Marker? marker = await DB.Markers.Find(x => x.Id == markerId).FirstOrDefaultAsync();

            if (marker == null)
            {
                return NotFound(new BaseResponse.ErrorResponse("Marker not found!"));
            }

            if (marker.UserId != AuthorizedUserId)
            {
                return BadRequest(new BaseResponse.ErrorResponse("The user is not the owner of the marker"));
            }

            return Ok(new MarkerResponse(marker));
        }

        [HttpGet("search")]
        public IActionResult GetMarkersByAuthUser([FromQuery] MarkerSearchQuery query)
        {
            if (User?.Identity?.IsAuthenticated != true)
            {
                return Unauthorized(new BaseResponse.ErrorResponse("Unauthorized!"));
            }

            string userId = AuthorizedUserId;

            List<Marker> markers = [.. DB.Markers
                .AsQueryable()
                .Where(x =>
                    x.UserId == userId &&
                    (x.Title.Contains(query.Search ?? "") ||
                    (x.Description ?? "").Contains(query.Search ?? "")) &&
                    (query.Importance == null ||
                    query.Importance.Length == 0 ||
                    query.Importance.Contains(x.Importance)) &&
                    x.StartsAt >= (query.MinTime ?? DateTime.MinValue) &&
                    x.StartsAt <= (query.MaxTime ?? DateTime.MaxValue))];

            Dictionary<string, int> ImportanceOrder = new()
            {
                {"low", 0},
                {"medium", 1},
                {"high", 2}
            };

            markers = query.SortType switch
            {
                "importance" => query.SortByAsc ?? true
                    ? [.. markers.OrderBy(x => ImportanceOrder.GetValueOrDefault(x.Importance))]
                    : [.. markers.OrderByDescending(x => ImportanceOrder.GetValueOrDefault(x.Importance))],
                "title" => query.SortByAsc ?? true
                    ? [.. markers.OrderBy(x => x.Title.ToLower())]
                    : [.. markers.OrderByDescending(x => x.Title.ToLower())],
                "startsAt" => query.SortByAsc ?? true
                    ? [.. markers.OrderBy(x => x.StartsAt)]
                    : [.. markers.OrderByDescending(x => x.StartsAt)],
                _ => query.SortByAsc ?? true
                    ? [.. markers.OrderBy(x => ImportanceOrder.GetValueOrDefault(x.Importance))]
                    : [.. markers.OrderByDescending(x => ImportanceOrder.GetValueOrDefault(x.Importance))],
            };

            return query.Format switch
            {
                "default" => Ok(new MarkerResponse(markers)),
                "short" => Ok(new ListResponse<MarkerResponse.ShortView>(
                    markers.Select(x => new MarkerResponse.ShortView(x)).ToList())),
                _ => Ok(new MarkerResponse(markers)),
            };
        }
    }
}
