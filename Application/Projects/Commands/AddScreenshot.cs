using Application.Core;
using Application.Interfaces;
using Application.Projects.DTOs;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Projects.Commands;

public class AddScreenshot
{
    public class Command : IRequest<Result<ProjectScreenshotDto>>
    {
        public string ProjectId { get; set; } = string.Empty;
        public required IFormFile File { get; set; }
        public string? Caption { get; set; }
        public int DisplayOrder { get; set; } = 0;
    }

    public class Handler(AppDbContext context, IPhotoService photoService, IMapper mapper)
        : IRequestHandler<Command, Result<ProjectScreenshotDto>>
    {
        public async Task<Result<ProjectScreenshotDto>> Handle(Command request, CancellationToken cancellationToken)
        {
            var project = await context.Projects
                .SingleOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

            if (project is null) return Result<ProjectScreenshotDto>.Failure("Project not found", 404);

            var uploadResult = await photoService.UploadPhoto(request.File);

            if (uploadResult is null) return Result<ProjectScreenshotDto>.Failure("Failed to upload screenshot", 400);

            var screenshot = new ProjectScreenshot
            {
                ProjectId = request.ProjectId,
                Url = uploadResult.Url,
                PublicId = uploadResult.PublicId,
                Caption = request.Caption,
                DisplayOrder = request.DisplayOrder
            };

            context.ProjectScreenshots.Add(screenshot);

            var result = await context.SaveChangesAsync(cancellationToken) > 0;

            return result
                ? Result<ProjectScreenshotDto>.Success(mapper.Map<ProjectScreenshotDto>(screenshot))
                : Result<ProjectScreenshotDto>.Failure("Failed to save screenshot", 400);
        }
    }
}
