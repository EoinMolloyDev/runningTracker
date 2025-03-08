using System.ComponentModel.DataAnnotations;

namespace RunningTracker.API.Models
{
    public class RunningActivity : BaseEntity
    {
        [Required]
        public DateTime Date { get; set; }
        
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Distance must be greater than 0")]
        public double Distance { get; set; } // in kilometers
        
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Duration must be greater than 0")]
        public int Duration { get; set; } // in seconds
        
        public double? Pace => Duration > 0 ? Math.Round(Duration / 60.0 / Distance, 2) : null; // minutes per kilometer
        
        public double? Speed => Duration > 0 ? Math.Round(Distance / (Duration / 3600.0), 2) : null; // kilometers per hour
        
        [StringLength(500)]
        public string? Notes { get; set; }
        
        public string? WeatherConditions { get; set; }
        
        public double? Temperature { get; set; } // in Celsius
        
        public int? UserId { get; set; }
        public User? User { get; set; }
        
        public int? RouteId { get; set; }
        public RunningRoute? Route { get; set; }
    }
} 