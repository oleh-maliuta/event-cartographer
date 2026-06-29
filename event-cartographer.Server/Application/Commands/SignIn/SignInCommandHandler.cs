using EventCartographer.Application.Common;
using EventCartographer.Application.Interfaces;
using EventCartographer.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventCartographer.Application.Commands.SignIn;

public class SignInCommandHandler(
    IApplicationDbContext db,
    IPasswordHandler passwordHandler) : IRequestHandler<SignInCommand, CommandResult<User>>
{
    public async Task<CommandResult<User>> Handle(
        SignInCommand request,
        CancellationToken cancellationToken)
    {
        User? user;
        string loginIdentifier = request.UsernameOrEmail ?? "";

        if (loginIdentifier.Contains('@'))
        {
            loginIdentifier = loginIdentifier.ToLower();
            user = await db.Users.FirstOrDefaultAsync(
                x => x.Email == loginIdentifier, cancellationToken);
        }
        else
        {
            user = await db.Users.FirstOrDefaultAsync(
                x => x.Name == loginIdentifier, cancellationToken);
        }

        if (user == null)
            return CommandResult<User>.Failure(
                "http.controller-errors.user.sign-in.username-email-or-password",
                statusCode: 400);

        if (!user.IsActivated)
            return CommandResult<User>.Failure(
                "http.controller-errors.user.sign-in.not-activated",
                statusCode: 401);

        if (!passwordHandler.Validate(request.Password ?? "", user.PasswordHash))
            return CommandResult<User>.Failure(
                "http.controller-errors.user.sign-in.username-email-or-password",
                statusCode: 400);

        user.LastActivityAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        return CommandResult<User>.Success(user, statusCode: 200);
    }
}
