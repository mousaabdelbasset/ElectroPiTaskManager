using ElectroPi.TaskManager.Application.DTOs.Projects;
using ElectroPi.TaskManager.Application.DTOs.Tasks;
using ElectroPi.TaskManager.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace ElectroPi.TaskManager.Api.Controllers;

[ApiController]
[Route("api/projects")]
public sealed class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;
    private readonly ITaskItemService _taskItemService;

    public ProjectsController(
        IProjectService projectService,
        ITaskItemService taskItemService)
    {
        _projectService = projectService;
        _taskItemService = taskItemService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProjectResponse>>> GetAll(
        CancellationToken cancellationToken)
    {
        var projects = await _projectService.GetAllAsync(cancellationToken);
        return Ok(projects);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProjectDetailsResponse>> GetById(
        int id,
        CancellationToken cancellationToken)
    {
        var project = await _projectService.GetByIdAsync(id, cancellationToken);
        return Ok(project);
    }

    [HttpPost]
    public async Task<ActionResult<ProjectResponse>> Create(
        CreateProjectRequest request,
        CancellationToken cancellationToken)
    {
        var project = await _projectService.CreateAsync(request, cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { id = project.Id },
            project);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        UpdateProjectRequest request,
        CancellationToken cancellationToken)
    {
        await _projectService.UpdateAsync(id, request, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(
        int id,
        CancellationToken cancellationToken)
    {
        await _projectService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpGet("{projectId:int}/tasks")]
    public async Task<ActionResult<IReadOnlyList<TaskItemResponse>>> GetTasks(
        int projectId,
        CancellationToken cancellationToken)
    {
        var tasks = await _taskItemService.GetByProjectIdAsync(
            projectId,
            cancellationToken);

        return Ok(tasks);
    }
}
