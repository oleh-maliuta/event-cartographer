using EventCartographer.Application.Common;
using EventCartographer.Domain.Entities;
using MediatR;

namespace EventCartographer.Application.Commands.SignIn;

public record SignInCommand(string? UsernameOrEmail, string? Password) : IRequest<CommandResult<User>>;
