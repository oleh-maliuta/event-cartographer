using MediatR;

namespace EventCartographer.Application.Commands.PurgeExpiredData;

public record PurgeExpiredDataCommand : IRequest;
