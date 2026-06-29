using EventCartographer.Application.Common;
using EventCartographer.Application.Interfaces;
using EventCartographer.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventCartographer.Application.Commands.GetUserById;

public class GetUserByIdCommandHandler(
    IApplicationDbContext db) : IRequestHandler<GetUserByIdCommand, CommandResult<User?>>
{
    public async Task<CommandResult<User?>> Handle(
        GetUserByIdCommand request,
        CancellationToken cancellationToken)
    {
        return CommandResult<User?>.Success(await db.Users.FirstOrDefaultAsync(
            x => x.Id == request.Id, cancellationToken));
    }
}
