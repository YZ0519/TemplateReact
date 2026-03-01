using Application.Projects.Commands;
using Application.Projects.DTOs;
using Application.Projects.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class ProjectsController : BaseApiController
{
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<List<ProjectSummaryDto>>> GetProjects()
        => HandleResult(await Mediator.Send(new GetProjects.Query()));

    [AllowAnonymous]
    [HttpGet("{slug}")]
    public async Task<ActionResult<ProjectDetailDto>> GetProjectBySlug(string slug)
        => HandleResult(await Mediator.Send(new GetProjectBySlug.Query { Slug = slug }));

    [HttpPost]
    public async Task<ActionResult<ProjectDetailDto>> CreateProject(CreateProject.Command command)
        => HandleResult(await Mediator.Send(command));

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateProject(string id, UpdateProject.Command command)
    {
        command.Id = id;
        return HandleResult(await Mediator.Send(command));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteProject(string id)
        => HandleResult(await Mediator.Send(new DeleteProject.Command { Id = id }));

    [HttpPost("{id}/tech-stack")]
    public async Task<ActionResult<ProjectTechStackDto>> AddTechStack(string id, AddTechStack.Command command)
    {
        command.ProjectId = id;
        return HandleResult(await Mediator.Send(command));
    }

    [HttpDelete("{id}/tech-stack/{itemId}")]
    public async Task<ActionResult> RemoveTechStack(string id, string itemId)
        => HandleResult(await Mediator.Send(new RemoveTechStack.Command { ProjectId = id, ItemId = itemId }));

    [HttpPost("{id}/features")]
    public async Task<ActionResult<ProjectFeatureDto>> AddFeature(string id, AddFeature.Command command)
    {
        command.ProjectId = id;
        return HandleResult(await Mediator.Send(command));
    }

    [HttpDelete("{id}/features/{featureId}")]
    public async Task<ActionResult> RemoveFeature(string id, string featureId)
        => HandleResult(await Mediator.Send(new RemoveFeature.Command { ProjectId = id, FeatureId = featureId }));

    [HttpPost("{id}/screenshots")]
    public async Task<ActionResult<ProjectScreenshotDto>> AddScreenshot(string id, IFormFile file,
        [FromForm] string? caption, [FromForm] int displayOrder = 0)
        => HandleResult(await Mediator.Send(new AddScreenshot.Command
            { ProjectId = id, File = file, Caption = caption, DisplayOrder = displayOrder }));

    [HttpDelete("{id}/screenshots/{screenshotId}")]
    public async Task<ActionResult> RemoveScreenshot(string id, string screenshotId)
        => HandleResult(await Mediator.Send(new RemoveScreenshot.Command { ProjectId = id, ScreenshotId = screenshotId }));
}
