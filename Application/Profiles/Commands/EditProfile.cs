using Application.Core;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Profiles.Commands
{
    public class EditProfile
    {
        public class Command : IRequest<Result<Unit>>
        {
            public string Bio { get; set; } = string.Empty;
            public string DisplayName { get; set; } = string.Empty;
        }

        public class Handler(AppDbContext context, IUserAccessor userAccessor) : IRequestHandler<Command, Result<Unit>>
        {
            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var user = await userAccessor.GetUserAsync();
                user.Bio = request.Bio;
                user.DisplayName = request.DisplayName;

                context.Entry(user).State = EntityState.Modified;
                var result = await context.SaveChangesAsync(cancellationToken) > 0;

                if (!result) return Result<Unit>.Failure("Failed to update profile", 400);

                return Result<Unit>.Success(Unit.Value);
            }
        }
    }
}
