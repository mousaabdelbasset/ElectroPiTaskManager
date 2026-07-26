using ElectroPi.TaskManager.Application.DTOs.Tasks;
using ElectroPi.TaskManager.Application.Exceptions;
using ElectroPi.TaskManager.Application.Interfaces.Services;
using ElectroPi.TaskManager.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace ElectroPi.TaskManager.Api.Controllers;

[ApiController]
[Route("api/tasks")]
public sealed class TasksController : ControllerBase
{
    private readonly ITaskItemService _taskItemService;

    public TasksController(ITaskItemService taskItemService)
    {
        _taskItemService = taskItemService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TaskItemResponse>>> GetAll(
        [FromQuery] string? status,
        CancellationToken cancellationToken)
    {
        var parsedStatus = ParseStatus(status);
        var tasks = await _taskItemService.GetAllAsync(parsedStatus, cancellationToken);
        return Ok(tasks);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TaskItemResponse>> GetById(
        int id,
        CancellationToken cancellationToken)
    {
        var task = await _taskItemService.GetByIdAsync(id, cancellationToken);
        return Ok(task);
    }

    [HttpPost]
    public async Task<ActionResult<TaskItemResponse>> Create(
        CreateTaskItemRequest request,
        CancellationToken cancellationToken)
    {
        var task = await _taskItemService.CreateAsync(request, cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { id = task.Id },
            task);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        UpdateTaskItemRequest request,
        CancellationToken cancellationToken)
    {
        await _taskItemService.UpdateAsync(id, request, cancellationToken);
        return NoContent();
    }

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(
        int id,
        UpdateTaskStatusRequest request,
        CancellationToken cancellationToken)
    {
        await _taskItemService.UpdateStatusAsync(id, request, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(
        int id,
        CancellationToken cancellationToken)
    {
        await _taskItemService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }

    private static TaskItemStatus? ParseStatus(string? status)
    {
        if (string.IsNullOrWhiteSpace(status))
        {
            return null;
        }

        var matchingName = Enum.GetNames<TaskItemStatus>()
            .FirstOrDefault(name =>
                string.Equals(name, status, StringComparison.OrdinalIgnoreCase));

        if (matchingName is null)
        {
            throw new BadRequestException(
                $"Task status '{status}' is invalid. Use ToDo, InProgress, or Done.");
        }

        return Enum.Parse<TaskItemStatus>(matchingName);
    }
}
