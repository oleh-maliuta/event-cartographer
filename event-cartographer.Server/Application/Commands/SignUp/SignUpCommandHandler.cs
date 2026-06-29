using EventCartographer.Application.Common;
using EventCartographer.Application.Interfaces;
using EventCartographer.Domain.Entities;
using EventCartographer.Domain.ValueClasses;
using Hangfire;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventCartographer.Application.Commands.SignUp;

public class SignUpCommandHandler(
    IApplicationDbContext db,
    IBackgroundJobClient backgroundJobClient,
    IPasswordHandler passwordHandler) : IRequestHandler<SignUpCommand, CommandResult<User>>
{
    public async Task<CommandResult<User>> Handle(
        SignUpCommand request,
        CancellationToken cancellationToken)
    {
        if (await db.Users.AnyAsync(x => x.Name == request.Username, cancellationToken))
            return CommandResult<User>.Failure(
                "http.controller-errors.user.sign-up.same-username",
                statusCode: 400);

        if (await db.Users.AnyAsync(x => x.Email == request.Email, cancellationToken))
            return CommandResult<User>.Failure(
                "http.controller-errors.user.sign-up.same-email",
                statusCode: 400);

        if (!passwordHandler.CheckFormat(request.Password ?? ""))
            return CommandResult<User>.Failure(
                "http.controller-errors.user.sign-up.incorrect-password",
                statusCode: 400);

        User user = db.Users.Add(new()
        {
            Name = request.Username!,
            Email = request.Email!,
            PasswordHash = passwordHandler.Hash(request.Password!),
            PermissionToDeletePastEvents = false,
            IsActivated = false,
            LastActivityAt = DateTime.UtcNow
        }).Entity;

        ActivationCode code = db.ActivationCodes.Add(new()
        {
            User = user,
            Action = ActivationCodeActions.Register,
            ExpiresAt = DateTime.UtcNow.AddHours(12)
        }).Entity;

        await db.SaveChangesAsync(cancellationToken);

        var finalEmailUrl = new UriBuilder(request.EmailUrl);
        using (var content = new FormUrlEncodedContent([
            new("email", request.Email!),
            new("token", code.Id.ToString("N")),
            new("locale", request.Locale),
        ])) { finalEmailUrl.Query = await content.ReadAsStringAsync(cancellationToken); }

        backgroundJobClient.Enqueue<IEmailService>(emailService =>
            emailService.SendEmailUseTemplateAsync(
                email: request.Email!,
                templateName: ActivationCodeActions.Register,
                parameters: new Dictionary<string, string>
                {
                    { "username", request.Username! },
                    { "link", finalEmailUrl.ToString() },
                },
                request.Locale!
            )
        );

        return CommandResult<User>.Success(user, statusCode: 201);
    }
}
