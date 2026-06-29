using EventCartographer.Application.Common;
using EventCartographer.Domain.Entities;
using MediatR;

namespace EventCartographer.Application.Commands.GetUserById;

public record GetUserByIdCommand(Guid Id) : IRequest<CommandResult<User?>>;
