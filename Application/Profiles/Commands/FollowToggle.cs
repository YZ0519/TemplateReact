using Application.Core;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Domain;

namespace Application.Profiles.Commands
{
    public class FollowToggle
    {
        public class Command : IRequest<Result<Unit>>
        {
            public required string TargetUserId { get; set; }
        }

        public class Handler(AppDbContext context, IUserAccessor userAccessor) : IRequestHandler<Command, Result<Unit>>
        {
            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var observer = await userAccessor.GetUserAsync();

                var target = await context.Users.FindAsync([request.TargetUserId], cancellationToken);
                if (target is null) return Result<Unit>.Failure("User not found", 404);

                var following = await context.UserFollowings
                    .FindAsync([observer.Id, request.TargetUserId], cancellationToken);

                if (following is null)
                {
                    context.UserFollowings.Add(new UserFollowing
                    {
                        ObserverId = observer.Id,
                        TargetId = request.TargetUserId
                    });
                }
                else
                {
                    context.UserFollowings.Remove(following);
                }

                var result = await context.SaveChangesAsync(cancellationToken) > 0;
                return result
                    ? Result<Unit>.Success(Unit.Value)
                    : Result<Unit>.Failure("Failed to update following", 400);
            }
        }
    }
}
