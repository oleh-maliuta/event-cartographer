using EventCartographer.Application.Common;
using EventCartographer.Domain.Entities;
using MediatR;

namespace EventCartographer.Application.Commands.SignUp;

public record SignUpCommand(
    string? Username,
    string? Email,
    string? Password,
    string? Locale,
    Uri EmailUrl) : IRequest<CommandResult<User>>;
