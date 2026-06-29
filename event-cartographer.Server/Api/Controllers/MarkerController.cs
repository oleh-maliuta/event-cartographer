using Microsoft.AspNetCore.Mvc;
using EventCartographer.Api.Attributes;
using Microsoft.EntityFrameworkCore;
using EventCartographer.Api.Models.Responses;
using EventCartographer.Api.Models.Requests.Queries;
using EventCartographer.Api.Models.Requests.Bodies;
using EventCartographer.Domain.Entities;
using EventCartographer.Domain.Constants;
using EventCartographer.Application.Interfaces;
using EventCartographer.Api.Common;
using MediatR;

namespace EventCartographer.Api.Controllers;

[ApiController]
[Route("api/markers")]
public class MarkerController(
    ISender mediator,
    IApplicationDbContext db) : BaseController(mediator)
{
    private readonly IApplicationDbContext _db = db;

    [Authorized]
    [HttpPost]
    public async Task<IActionResult> AddMarker(
        [FromBody] AddMarkerRequest request)
    {
        User user = await GetAuthUser();

        if ((await _db.Markers.CountAsync(x => x.UserId == user.Id)) >= MarkerConstants.MarkerLimit)
        {
            return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.marker.add-marker.max-markers"));
        }

        if (user.PermissionToDeletePastEvents)
        {
            DateTime now = DateTime.UtcNow;

            if (request.StartsAt < now)
            {
                return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.marker.add-marker.past-event-time"));
            }

            Marker[] passedEvents = await _db.Markers
                .Where(x => x.UserId == user.Id && x.StartsAt < now)
                .ToArrayAsync();

            _db.Markers.RemoveRange(passedEvents);
        }

        Marker marker = (await _db.Markers.AddAsync(new()
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

        await _db.SaveChangesAsync();
        return StatusCode(201, new MarkerResponse(marker));
    }

    [Authorized]
    [HttpPut("{markerId:guid}")]
    public async Task<IActionResult> UpdateMarker(
        [FromRoute] Guid markerId,
        [FromBody] UpdateMarkerRequest request)
    {
        User user = await GetAuthUser();
        Marker? marker = await _db.Markers.FirstOrDefaultAsync(x => x.Id == markerId);

        if (marker == null)
        {
            return NotFound(new BaseResponse.ErrorResponse("http.controller-errors.marker.update-marker.marker-not-found"));
        }

        if (marker.UserId != AuthorizedUserId)
        {
            return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.marker.update-marker.not-owner"));
        }

        if (user.PermissionToDeletePastEvents)
        {
            DateTime now = DateTime.UtcNow;

            if (request.StartsAt < now)
            {
                return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.marker.update-marker.past-event-time"));
            }
        }

        marker.Latitude = request.Latitude!.Value;
        marker.Longitude = request.Longitude!.Value;
        marker.Title = request.Title!;
        marker.Description = request.Description;
        marker.Importance = request.Importance!;
        marker.StartsAt = request.StartsAt!.Value;

        user.LastActivityAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(new MarkerResponse(marker));
    }

    [Authorized]
    [HttpDelete("{markerId:guid}")]
    public async Task<IActionResult> DeleteMarker(
        [FromRoute] Guid markerId)
    {
        User user = await GetAuthUser();
        Marker? marker = await _db.Markers.FirstOrDefaultAsync(x => x.Id == markerId);

        if (marker == null)
        {
            return NotFound(new BaseResponse.ErrorResponse("http.controller-errors.marker.delete-marker.marker-not-found"));
        }

        if (marker.UserId != AuthorizedUserId)
        {
            return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.marker.delete-marker.not-owner"));
        }

        if (user.PermissionToDeletePastEvents)
        {
            DateTime now = DateTime.UtcNow;

            Marker[] passedEvents = await _db.Markers
                .Where(x => x.UserId == user.Id && x.StartsAt < now)
                .ToArrayAsync();

            _db.Markers.RemoveRange(passedEvents);
        }

        _db.Markers.Remove(marker);

        user.LastActivityAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(new MarkerResponse(marker));
    }

    [Authorized]
    [HttpGet("{markerId:guid}")]
    public async Task<IActionResult> GetMarker(
        [FromRoute] Guid markerId)
    {
        Marker? marker = await _db.Markers.FirstOrDefaultAsync(x => x.Id == markerId);

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
    public async Task<IActionResult> GetMarkersByBounds(
        [FromQuery] MarkerBoundQuery query)
    {
        User user = await GetAuthUser();

        Marker[] markers = await _db.Markers
            .Where(x =>
                x.UserId == user.Id &&
                (!user.PermissionToDeletePastEvents || x.StartsAt >= DateTime.UtcNow) &&
                x.Latitude <= (query.NorthEastLatitude ?? decimal.MinValue) &&
                x.Latitude >= (query.SouthWestLatitude ?? decimal.MaxValue) &&
                x.Longitude <= (query.NorthEastLongitude ?? decimal.MinValue) &&
                x.Longitude >= (query.SouthWestLongitude ?? decimal.MaxValue))
            .ToArrayAsync();

        user.LastActivityAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(new MarkerResponse(markers));
    }

    [Authorized]
    [HttpGet("search")]
    public async Task<IActionResult> GetMarkersByAuthUser(
        [FromQuery] PageQuery pageQuery,
        [FromQuery] MarkerSearchQuery query)
    {
        User user = await GetAuthUser();

        List<Marker> markers = await _db.Markers
            .Where(x =>
                x.UserId == user.Id &&
                (!user.PermissionToDeletePastEvents || x.StartsAt >= DateTime.UtcNow) &&
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

        await _db.SaveChangesAsync();
        return Ok(response);
    }
}
