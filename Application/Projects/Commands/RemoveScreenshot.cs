using Application.Core;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Projects.Commands;

public class RemoveScreenshot
{
    public class Command : IRequest<Result<Unit>>
    {
        public required string ProjectId { get; set; }
        public required string ScreenshotId { get; set; }
    }

    public class Handler(AppDbContext context, IPhotoService photoService) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var screenshot = await context.ProjectScreenshots
                .SingleOrDefaultAsync(s => s.Id == request.ScreenshotId && s.ProjectId == request.ProjectId, cancellationToken);

            if (screenshot is null) return Result<Unit>.Failure("Screenshot not found", 404);

            await photoService.DeletePhoto(screenshot.PublicId);

            context.ProjectScreenshots.Remove(screenshot);

            var result = await context.SaveChangesAsync(cancellationToken) > 0;

            return result
                ? Result<Unit>.Success(Unit.Value)
                : Result<Unit>.Failure("Failed to remove screenshot", 400);
        }
    }
}
