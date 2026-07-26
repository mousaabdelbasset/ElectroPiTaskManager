using ElectroPi.TaskManager.Application.DTOs.Tasks;
using ElectroPi.TaskManager.Application.Exceptions;
using ElectroPi.TaskManager.Application.Interfaces.Repositories;
using ElectroPi.TaskManager.Application.Interfaces.Services;
using ElectroPi.TaskManager.Domain.Entities;
using ElectroPi.TaskManager.Domain.Enums;

namespace ElectroPi.TaskManager.Application.Services;

public sealed class TaskItemService : ITaskItemService
{
    private readonly ITaskItemRepository _taskItemRepository;
    private readonly IProjectRepository _projectRepository;

    public TaskItemService(
        ITaskItemRepository taskItemRepository,
        IProjectRepository projectRepository)
    {
        _taskItemRepository = taskItemRepository;
        _projectRepository = projectRepository;
    }

    public async Task<IReadOnlyList<TaskItemResponse>> GetAllAsync(
        TaskItemStatus? status,
        CancellationToken cancellationToken)
    {
        if (status.HasValue)
        {
            EnsureValidStatus(status.Value);
        }

        var taskItems = await _taskItemRepository.GetAllAsync(status, cancellationToken);
        return taskItems.Select(MapTask).ToList();
    }

    public async Task<IReadOnlyList<TaskItemResponse>> GetByProjectIdAsync(
        int projectId,
        CancellationToken cancellationToken)
    {
        EnsureValidProjectId(projectId);
        await EnsureProjectExistsAsync(projectId, cancellationToken);

        var taskItems = await _taskItemRepository.GetByProjectIdAsync(
            projectId,
            cancellationToken);

        return taskItems.Select(MapTask).ToList();
    }

    public async Task<TaskItemResponse> GetByIdAsync(
        int id,
        CancellationToken cancellationToken)
    {
        EnsureValidTaskId(id);

        var taskItem = await GetTaskOrThrowAsync(id, cancellationToken);
        return MapTask(taskItem);
    }

    public async Task<TaskItemResponse> CreateAsync(
        CreateTaskItemRequest request,
        CancellationToken cancellationToken)
    {
        ValidateTaskInput(
            request.Title,
            request.Status,
            request.DueDate,
            request.ProjectId);
        EnsureDueDateIsNotPast(request.DueDate);

        await EnsureProjectExistsAsync(request.ProjectId, cancellationToken);

        var taskItem = new TaskItem
        {
            Title = request.Title.Trim(),
            Description = NormalizeOptionalText(request.Description),
            Status = request.Status!.Value,
            DueDate = request.DueDate,
            ProjectId = request.ProjectId
        };

        var createdTask = await _taskItemRepository.AddAsync(taskItem, cancellationToken);
        return MapTask(createdTask);
    }

    public async Task UpdateAsync(
        int id,
        UpdateTaskItemRequest request,
        CancellationToken cancellationToken)
    {
        EnsureValidTaskId(id);
        ValidateTaskInput(
            request.Title,
            request.Status,
            request.DueDate,
            request.ProjectId);

        var taskItem = await GetTaskOrThrowAsync(id, cancellationToken);
        EnsureUpdatedDueDateIsAllowed(request.DueDate, taskItem.DueDate);
        await EnsureProjectExistsAsync(request.ProjectId, cancellationToken);

        taskItem.Title = request.Title.Trim();
        taskItem.Description = NormalizeOptionalText(request.Description);
        taskItem.Status = request.Status!.Value;
        taskItem.DueDate = request.DueDate;
        taskItem.ProjectId = request.ProjectId;

        await _taskItemRepository.UpdateAsync(taskItem, cancellationToken);
    }

    public async Task UpdateStatusAsync(
        int id,
        UpdateTaskStatusRequest request,
        CancellationToken cancellationToken)
    {
        EnsureValidTaskId(id);
        EnsureValidStatus(request.Status);

        var taskItem = await GetTaskOrThrowAsync(id, cancellationToken);
        taskItem.Status = request.Status!.Value;

        await _taskItemRepository.UpdateAsync(taskItem, cancellationToken);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken)
    {
        EnsureValidTaskId(id);

        var taskItem = await GetTaskOrThrowAsync(id, cancellationToken);
        await _taskItemRepository.DeleteAsync(taskItem, cancellationToken);
    }

    private async Task<TaskItem> GetTaskOrThrowAsync(
        int id,
        CancellationToken cancellationToken)
    {
        return await _taskItemRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Task with id {id} was not found.");
    }

    private async Task EnsureProjectExistsAsync(
        int projectId,
        CancellationToken cancellationToken)
    {
        if (!await _projectRepository.ExistsAsync(projectId, cancellationToken))
        {
            throw new NotFoundException($"Project with id {projectId} was not found.");
        }
    }

    private static TaskItemResponse MapTask(TaskItem taskItem)
    {
        return new TaskItemResponse
        {
            Id = taskItem.Id,
            Title = taskItem.Title,
            Description = taskItem.Description,
            Status = taskItem.Status,
            DueDate = taskItem.DueDate,
            ProjectId = taskItem.ProjectId
        };
    }

    private static void ValidateTaskInput(
        string title,
        TaskItemStatus? status,
        DateTime dueDate,
        int projectId)
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            throw new BadRequestException("Task title is required.");
        }

        EnsureValidStatus(status);

        if (dueDate == default)
        {
            throw new BadRequestException("Due date must contain a valid date.");
        }

        EnsureValidProjectId(projectId);
    }

    private static void EnsureValidStatus(TaskItemStatus? status)
    {
        if (!status.HasValue || !Enum.IsDefined(status.Value))
        {
            throw new BadRequestException($"Task status '{status}' is invalid.");
        }
    }

    private static void EnsureValidTaskId(int id)
    {
        if (id <= 0)
        {
            throw new BadRequestException("Task id must be greater than zero.");
        }
    }

    private static void EnsureValidProjectId(int projectId)
    {
        if (projectId <= 0)
        {
            throw new BadRequestException("Project id must be greater than zero.");
        }
    }

    private static void EnsureDueDateIsNotPast(DateTime dueDate)
    {
        if (dueDate.Date < DateTime.Today)
        {
            throw new BadRequestException("Due date cannot be before today.");
        }
    }

    private static void EnsureUpdatedDueDateIsAllowed(DateTime dueDate, DateTime existingDueDate)
    {
        if (dueDate.Date >= DateTime.Today)
        {
            return;
        }

        // The UI stores minute precision, so an unchanged historical value may lose seconds in transit.
        var unchangedHistoricalValue =
            dueDate.Year == existingDueDate.Year &&
            dueDate.Month == existingDueDate.Month &&
            dueDate.Day == existingDueDate.Day &&
            dueDate.Hour == existingDueDate.Hour &&
            dueDate.Minute == existingDueDate.Minute;

        if (!unchangedHistoricalValue)
        {
            throw new BadRequestException("Due date cannot be changed to a date before today.");
        }
    }

    private static string? NormalizeOptionalText(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
