using ElectroPi.TaskManager.Application.DTOs.Projects;
using ElectroPi.TaskManager.Application.DTOs.Tasks;
using ElectroPi.TaskManager.Application.Exceptions;
using ElectroPi.TaskManager.Application.Interfaces.Repositories;
using ElectroPi.TaskManager.Application.Interfaces.Services;
using ElectroPi.TaskManager.Domain.Entities;

namespace ElectroPi.TaskManager.Application.Services;

public sealed class ProjectService : IProjectService
{
    private readonly IProjectRepository _projectRepository;

    public ProjectService(IProjectRepository projectRepository)
    {
        _projectRepository = projectRepository;
    }

    public async Task<IReadOnlyList<ProjectResponse>> GetAllAsync(
        CancellationToken cancellationToken)
    {
        var projects = await _projectRepository.GetAllAsync(cancellationToken);
        return projects.Select(MapProject).ToList();
    }

    public async Task<ProjectDetailsResponse> GetByIdAsync(
        int id,
        CancellationToken cancellationToken)
    {
        EnsureValidId(id);

        var project = await _projectRepository.GetByIdWithTasksAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Project with id {id} was not found.");

        return new ProjectDetailsResponse
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            CreatedAt = project.CreatedAt,
            Tasks = project.Tasks
                .OrderBy(task => task.Id)
                .Select(MapTask)
                .ToList()
        };
    }

    public async Task<ProjectResponse> CreateAsync(
        CreateProjectRequest request,
        CancellationToken cancellationToken)
    {
        EnsureValidName(request.Name);

        var project = new Project
        {
            Name = request.Name.Trim(),
            Description = NormalizeOptionalText(request.Description),
            CreatedAt = DateTime.UtcNow
        };

        var createdProject = await _projectRepository.AddAsync(project, cancellationToken);
        return MapProject(createdProject);
    }

    public async Task UpdateAsync(
        int id,
        UpdateProjectRequest request,
        CancellationToken cancellationToken)
    {
        EnsureValidId(id);
        EnsureValidName(request.Name);

        var project = await _projectRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Project with id {id} was not found.");

        project.Name = request.Name.Trim();
        project.Description = NormalizeOptionalText(request.Description);

        await _projectRepository.UpdateAsync(project, cancellationToken);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken)
    {
        EnsureValidId(id);

        var project = await _projectRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Project with id {id} was not found.");

        if (await _projectRepository.HasTasksAsync(id, cancellationToken))
        {
            throw new ConflictException(
                $"Project with id {id} cannot be deleted because it contains tasks.");
        }

        await _projectRepository.DeleteAsync(project, cancellationToken);
    }

    private static ProjectResponse MapProject(Project project)
    {
        return new ProjectResponse
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            CreatedAt = project.CreatedAt
        };
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

    private static void EnsureValidId(int id)
    {
        if (id <= 0)
        {
            throw new BadRequestException("Project id must be greater than zero.");
        }
    }

    private static void EnsureValidName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new BadRequestException("Project name is required.");
        }
    }

    private static string? NormalizeOptionalText(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
