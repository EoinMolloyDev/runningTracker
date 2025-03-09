using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RunningTracker.API.Data;
using RunningTracker.API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RunningTracker.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RunningActivitiesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly GoalsController _goalsController;

        public RunningActivitiesController(ApplicationDbContext context)
        {
            _context = context;
            _goalsController = new GoalsController(context);
        }

        // GET: api/RunningActivities
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RunningActivity>>> GetRunningActivities()
        {
            return await _context.RunningActivities.ToListAsync();
        }

        // GET: api/RunningActivities/5
        [HttpGet("{id}")]
        public async Task<ActionResult<RunningActivity>> GetRunningActivity(int id)
        {
            var runningActivity = await _context.RunningActivities.FindAsync(id);

            if (runningActivity == null)
            {
                return NotFound();
            }

            return runningActivity;
        }

        // POST: api/RunningActivities
        [HttpPost]
        public async Task<ActionResult<RunningActivity>> PostRunningActivity(RunningActivity runningActivity)
        {
            _context.RunningActivities.Add(runningActivity);
            await _context.SaveChangesAsync();

            // Update goal progress
            await UpdateGoalProgress();

            return CreatedAtAction(nameof(GetRunningActivity), new { id = runningActivity.Id }, runningActivity);
        }

        // PUT: api/RunningActivities/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRunningActivity(int id, RunningActivity runningActivity)
        {
            if (id != runningActivity.Id)
            {
                return BadRequest();
            }

            _context.Entry(runningActivity).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                
                // Update goal progress
                await UpdateGoalProgress();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RunningActivityExists(id))
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

        // DELETE: api/RunningActivities/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRunningActivity(int id)
        {
            var runningActivity = await _context.RunningActivities.FindAsync(id);
            if (runningActivity == null)
            {
                return NotFound();
            }

            _context.RunningActivities.Remove(runningActivity);
            await _context.SaveChangesAsync();
            
            // Update goal progress
            await UpdateGoalProgress();

            return NoContent();
        }

        private bool RunningActivityExists(int id)
        {
            return _context.RunningActivities.Any(e => e.Id == id);
        }
        
        // Helper method to update goal progress
        private async Task UpdateGoalProgress()
        {
            try
            {
                await _goalsController.UpdateAllGoalsProgress();
            }
            catch (Exception ex)
            {
                // Log the error but don't fail the activity operation
                Console.WriteLine($"Error updating goal progress: {ex.Message}");
            }
        }
    }
} 