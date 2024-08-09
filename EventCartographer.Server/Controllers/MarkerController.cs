using EventCartographer.Server.Responses;
using EventCartographer.Server.Models;
using EventCartographer.Server.Requests;
using Microsoft.AspNetCore.Mvc;
using EventCartographer.Server.Requests.Queries;
using EventCartographer.Server.Attributes;
using EventCartographer.Server.Services.EntityFramework;
using Microsoft.EntityFrameworkCore;

namespace EventCartographer.Server.Controllers
{
    [ApiController]
    [Route("api/markers")]
    public class MarkerController : BaseController
    {
        public MarkerController(DbApp service) : base(service) { }

        [Authorized]
        [HttpPost]
        public async Task<IActionResult> AddMarker(AddMarkerRequest request)
        {
            const int maxMarkerAmount = 500;
            User user = AuthorizedUser;

            if ((await DB.Markers.CountAsync(x => x.UserId == user.Id)) >= maxMarkerAmount)
            {
                return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.marker.add-marker.max-markers"));
            }

            string[] importanceArray = ["low", "medium", "high"];

            if (!importanceArray.Contains(request.Importance))
            {
                return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.marker.add-marker.importance-value"));
            }

            Marker marker = (await DB.Markers.AddAsync(new()
            {
                UserId = user.Id,
                User = user,
                Latitude = request.Latitude!.Value,
                Longitude = request.Longitude!.Value,
                Title = request.Title!,
                Description = request.Description,
                Importance = request.Importance!,
                StartsAt = request.StartsAt!.Value
            })).Entity;

            user.LastActivityAt = DateTime.UtcNow;

            await DB.SaveChangesAsync();
            return Ok(new MarkerResponse(marker));
        }

        [Authorized]
        [HttpPut("{markerId}")]
        public async Task<IActionResult> UpdateMarker(
            int markerId,
            UpdateMarkerRequest request)
        {
            string[] importanceArray = ["low", "medium", "high"];
            User user = AuthorizedUser;
            Marker? marker = await DB.Markers.SingleOrDefaultAsync(x => x.Id == markerId);

            if (marker == null)
            {
                return NotFound(new BaseResponse.ErrorResponse("http.controller-errors.marker.update-marker.marker-not-found"));
            }

            if (marker.UserId != AuthorizedUserId)
            {
                return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.marker.update-marker.not-owner"));
            }

            if (!importanceArray.Contains(request.Importance))
            {
                return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.marker.update-marker.importance-value"));
            }

            marker.Latitude = request.Latitude!.Value;
            marker.Longitude = request.Longitude!.Value;
            marker.Title = request.Title!;
            marker.Description = request.Description;
            marker.Importance = request.Importance!;
            marker.StartsAt = request.StartsAt!.Value;

            user.LastActivityAt = DateTime.UtcNow;

            await DB.SaveChangesAsync();
            return Ok(new MarkerResponse(marker));
        }

        [Authorized]
        [HttpDelete("{markerId}")]
        public async Task<IActionResult> DeleteMarker(int markerId)
        {
            User user = AuthorizedUser;
            Marker? marker = await DB.Markers.SingleOrDefaultAsync(x => x.Id == markerId);

            if (marker == null)
            {
                return NotFound(new BaseResponse.ErrorResponse("http.controller-errors.marker.delete-marker.marker-not-found"));
            }

            if (marker.UserId != AuthorizedUserId)
            {
                return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.marker.delete-marker.not-owner"));
            }

            user.LastActivityAt = DateTime.UtcNow;

            DB.Markers.Remove(marker);

            await DB.SaveChangesAsync();
            return Ok(new MarkerResponse(marker));
        }

        [Authorized]
        [HttpGet("{markerId}")]
        public async Task<IActionResult> GetMarker(int markerId)
        {
            Marker? marker = await DB.Markers.SingleOrDefaultAsync(x => x.Id == markerId);

            if (marker == null)
            {
                return NotFound(new BaseResponse.ErrorResponse("http.controller-errors.marker.get-marker.marker-not-found"));
            }

            if (marker.UserId != AuthorizedUserId)
            {
                return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.marker.get-marker.not-owner"));
            }

            return Ok(new MarkerResponse(marker));
        }

        [Authorized]
        [HttpGet("map")]
        public async Task<IActionResult> GetMarkersByBounds([FromQuery] MarkerBoundQuery query)
        {
            User user = AuthorizedUser;

            Marker[] markers = await DB.Markers
                .Where(x =>
                    x.UserId == user.Id &&
                    x.Latitude <= (query.NorthEastLatitude ?? decimal.MinValue) &&
                    x.Latitude >= (query.SouthWestLatitude ?? decimal.MaxValue) &&
                    x.Longitude <= (query.NorthEastLongitude ?? decimal.MinValue) &&
                    x.Longitude >= (query.SouthWestLongitude ?? decimal.MaxValue))
                .ToArrayAsync();

            user.LastActivityAt = DateTime.UtcNow;

            await DB.SaveChangesAsync();
            return Ok(new MarkerResponse(markers));
        }

        [Authorized]
        [HttpGet("search")]
        public async Task<IActionResult> GetMarkersByAuthUser(
            [FromQuery] PageQuery pageQuery,
            [FromQuery] MarkerSearchQuery query)
        {
            User user = AuthorizedUser;

            List<Marker> markers = await DB.Markers
                .Where(x =>
                    x.UserId == user.Id &&
                    (x.Title.Contains(query.Search ?? "") ||
                    (x.Description ?? "").Contains(query.Search ?? "")) &&
                    (query.Importance == null ||
                    query.Importance.Length == 0 ||
                    query.Importance.Contains(x.Importance)) &&
                    x.StartsAt >= (query.MinTime ?? DateTime.MinValue) &&
                    x.StartsAt <= (query.MaxTime ?? DateTime.MaxValue))
                .ToListAsync();

            Dictionary<string, int> importanceOrder = new()
            {
                {"low", 0},
                {"medium", 1},
                {"high", 2}
            };

            markers = query.SortType switch
            {
                "importance" => query.SortByAsc ?? true
                    ? [.. markers.OrderBy(x => importanceOrder.GetValueOrDefault(x.Importance))]
                    : [.. markers.OrderByDescending(x => importanceOrder.GetValueOrDefault(x.Importance))],
                "title" => query.SortByAsc ?? true
                    ? [.. markers.OrderBy(x => x.Title.ToLower())]
                    : [.. markers.OrderByDescending(x => x.Title.ToLower())],
                "startsAt" => query.SortByAsc ?? true
                    ? [.. markers.OrderBy(x => x.StartsAt)]
                    : [.. markers.OrderByDescending(x => x.StartsAt)],
                _ => query.SortByAsc ?? true
                    ? [.. markers.OrderBy(x => importanceOrder.GetValueOrDefault(x.Importance))]
                    : [.. markers.OrderByDescending(x => importanceOrder.GetValueOrDefault(x.Importance))],
            };

            int totalItemsCount = markers.Count;
            int totalPagesCount = (int)Math.Ceiling((double)totalItemsCount / pageQuery.PageSize);
            markers = [.. markers.Skip((pageQuery.Page - 1) * pageQuery.PageSize).Take(pageQuery.PageSize)];

            MarkerResponse.View[] result = [.. markers.Select(p => new MarkerResponse.View(p))];

            user.LastActivityAt = DateTime.UtcNow;

            PageResponse<MarkerResponse.View> response = new(
                result,
                pageQuery.Page,
                pageQuery.PageSize,
                totalPagesCount);

            await DB.SaveChangesAsync();
            return Ok(response);
        }
    }
}
