using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RunningTracker.API.Data;
using RunningTracker.API.Models;
using RunningTracker.API.Models.DTOs;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RunningTracker.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GoalsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public GoalsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Goals
        [HttpGet]
        public async Task<ActionResult<IEnumerable<GoalDTO>>> GetGoals()
        {
            var goals = await _context.Goals.ToListAsync();
            return goals.Select(g => MapToDTO(g)).ToList();
        }

        // GET: api/Goals/5
        [HttpGet("{id}")]
        public async Task<ActionResult<GoalDTO>> GetGoal(int id)
        {
            var goal = await _context.Goals.FindAsync(id);

            if (goal == null)
            {
                return NotFound();
            }

            return MapToDTO(goal);
        }

        // GET: api/Goals/user/5
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<GoalDTO>>> GetUserGoals(int userId)
        {
            var goals = await _context.Goals
                .Where(g => g.UserId == userId)
                .ToListAsync();

            return goals.Select(g => MapToDTO(g)).ToList();
        }

        // POST: api/Goals
        [HttpPost]
        public async Task<ActionResult<GoalDTO>> CreateGoal([FromBody] object rawData)
        {
            try
            {
                // Log the raw data
                Console.WriteLine($"Raw data: {rawData}");
                
                // Manually deserialize the data
                var jsonDocument = System.Text.Json.JsonDocument.Parse(rawData.ToString());
                var root = jsonDocument.RootElement;
                
                // Log the deserialized data
                foreach (var property in root.EnumerateObject())
                {
                    Console.WriteLine($"{property.Name}: {property.Value}");
                }
                
                // Create a new goal manually
                var goal = new Goal
                {
                    Name = root.TryGetProperty("name", out var name) ? name.GetString() : string.Empty,
                    Description = root.TryGetProperty("description", out var desc) ? desc.GetString() : null,
                    TargetValue = root.TryGetProperty("targetValue", out var targetValue) ? 
                        targetValue.GetDouble() : 0,
                    CurrentValue = 0, // Initialize with 0
                    GoalType = root.TryGetProperty("goalType", out var goalType) ? 
                        (GoalType)Enum.Parse(typeof(GoalType), goalType.GetString()) : GoalType.TotalDistance,
                    Timeframe = root.TryGetProperty("timeframe", out var timeframe) ? 
                        (GoalTimeframe)Enum.Parse(typeof(GoalTimeframe), timeframe.GetString()) : GoalTimeframe.Weekly,
                    StartDate = root.TryGetProperty("startDate", out var startDate) ? 
                        DateTime.Parse(startDate.GetString()) : DateTime.Now,
                    EndDate = root.TryGetProperty("endDate", out var endDate) ? 
                        DateTime.Parse(endDate.GetString()) : DateTime.Now.AddDays(7),
                    IsCompleted = false, // Initialize as not completed
                    UserId = null
                };

                _context.Goals.Add(goal);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetGoal), new { id = goal.Id }, MapToDTO(goal));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in CreateGoal: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "An error occurred while creating the goal", error = ex.Message });
            }
        }

        // PUT: api/Goals/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGoal(int id, UpdateGoalDTO updateGoalDto)
        {
            var goal = await _context.Goals.FindAsync(id);
            if (goal == null)
            {
                return NotFound();
            }

            // Update only the properties that are provided
            if (updateGoalDto.Name != null)
                goal.Name = updateGoalDto.Name;
            
            if (updateGoalDto.Description != null)
                goal.Description = updateGoalDto.Description;
            
            if (updateGoalDto.TargetValue.HasValue)
                goal.TargetValue = updateGoalDto.TargetValue.Value;
            
            if (updateGoalDto.GoalType.HasValue)
                goal.GoalType = updateGoalDto.GoalType.Value;
            
            if (updateGoalDto.Timeframe.HasValue)
                goal.Timeframe = updateGoalDto.Timeframe.Value;
            
            if (updateGoalDto.StartDate.HasValue)
                goal.StartDate = updateGoalDto.StartDate.Value;
            
            if (updateGoalDto.EndDate.HasValue)
                goal.EndDate = updateGoalDto.EndDate.Value;
            
            if (updateGoalDto.CurrentValue.HasValue)
                goal.CurrentValue = updateGoalDto.CurrentValue.Value;
            
            if (updateGoalDto.IsCompleted.HasValue)
                goal.IsCompleted = updateGoalDto.IsCompleted.Value;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!GoalExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // PUT: api/Goals/5/progress
        [HttpPut("{id}/progress")]
        public async Task<IActionResult> UpdateGoalProgress(int id, [FromBody] double currentValue)
        {
            var goal = await _context.Goals.FindAsync(id);
            if (goal == null)
            {
                return NotFound();
            }

            goal.CurrentValue = currentValue;
            
            // Check if goal is completed based on goal type
            if (goal.GoalType == GoalType.AveragePace || goal.GoalType == GoalType.FastestPace)
            {
                // For pace goals, lower is better
                goal.IsCompleted = currentValue <= goal.TargetValue && currentValue > 0;
            }
            else
            {
                // For other goals, higher is better
                goal.IsCompleted = currentValue >= goal.TargetValue;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PUT: api/Goals/updateProgress
        [HttpPut("updateProgress")]
        public async Task<IActionResult> UpdateAllGoalsProgress()
        {
            try
            {
                // Get all active goals (not completed and end date in the future)
                var activeGoals = await _context.Goals
                    .Where(g => !g.IsCompleted && g.EndDate >= DateTime.Now)
                    .ToListAsync();

                if (!activeGoals.Any())
                {
                    return Ok(new { message = "No active goals to update" });
                }

                // Get all activities
                var activities = await _context.RunningActivities.ToListAsync();

                foreach (var goal in activeGoals)
                {
                    // Filter activities within the goal's timeframe
                    var relevantActivities = activities
                        .Where(a => a.Date >= goal.StartDate && a.Date <= goal.EndDate)
                        .ToList();

                    // Calculate current value based on goal type
                    switch (goal.GoalType)
                    {
                        case GoalType.TotalDistance:
                            goal.CurrentValue = relevantActivities.Sum(a => a.Distance);
                            break;

                        case GoalType.TotalActivities:
                            goal.CurrentValue = relevantActivities.Count;
                            break;

                        case GoalType.AveragePace:
                            if (relevantActivities.Any())
                            {
                                double totalDistance = relevantActivities.Sum(a => a.Distance);
                                double totalDuration = relevantActivities.Sum(a => a.Duration);
                                goal.CurrentValue = totalDistance > 0 ? totalDuration / 60 / totalDistance : 0;
                            }
                            break;

                        case GoalType.LongestRun:
                            goal.CurrentValue = relevantActivities.Any() ? relevantActivities.Max(a => a.Distance) : 0;
                            break;

                        case GoalType.FastestPace:
                            var pacedActivities = relevantActivities
                                .Where(a => a.Pace.HasValue && a.Pace.Value > 0)
                                .ToList();
                            goal.CurrentValue = pacedActivities.Any() ? pacedActivities.Min(a => a.Pace.Value) : 0;
                            break;
                    }

                    // Check if goal is completed
                    if (goal.GoalType == GoalType.AveragePace || goal.GoalType == GoalType.FastestPace)
                    {
                        // For pace goals, lower is better
                        goal.IsCompleted = goal.CurrentValue <= goal.TargetValue && goal.CurrentValue > 0;
                    }
                    else
                    {
                        // For other goals, higher is better
                        goal.IsCompleted = goal.CurrentValue >= goal.TargetValue;
                    }
                }

                // Save changes to database
                await _context.SaveChangesAsync();

                return Ok(new { message = $"Updated progress for {activeGoals.Count} goals" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in UpdateAllGoalsProgress: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "An error occurred while updating goals progress", error = ex.Message });
            }
        }

        // DELETE: api/Goals/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGoal(int id)
        {
            var goal = await _context.Goals.FindAsync(id);
            if (goal == null)
            {
                return NotFound();
            }

            _context.Goals.Remove(goal);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool GoalExists(int id)
        {
            return _context.Goals.Any(e => e.Id == id);
        }

        private static GoalDTO MapToDTO(Goal goal)
        {
            return new GoalDTO
            {
                Id = goal.Id,
                Name = goal.Name,
                Description = goal.Description,
                TargetValue = goal.TargetValue,
                CurrentValue = goal.CurrentValue,
                GoalType = goal.GoalType,
                Timeframe = goal.Timeframe,
                StartDate = goal.StartDate,
                EndDate = goal.EndDate,
                IsCompleted = goal.IsCompleted,
                UserId = goal.UserId,
                CreatedAt = goal.CreatedAt,
                UpdatedAt = goal.UpdatedAt
            };
        }
    }
} 