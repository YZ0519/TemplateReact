using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Projects.Commands;

public class RemoveFeature
{
    public class Command : IRequest<Result<Unit>>
    {
        public required string ProjectId { get; set; }
        public required string FeatureId { get; set; }
    }

    public class Handler(AppDbContext context) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var feature = await context.ProjectFeatures
                .SingleOrDefaultAsync(f => f.Id == request.FeatureId && f.ProjectId == request.ProjectId, cancellationToken);

            if (feature is null) return Result<Unit>.Failure("Feature not found", 404);

            context.ProjectFeatures.Remove(feature);

            var result = await context.SaveChangesAsync(cancellationToken) > 0;

            return result
                ? Result<Unit>.Success(Unit.Value)
                : Result<Unit>.Failure("Failed to remove feature", 400);
        }
    }
}
