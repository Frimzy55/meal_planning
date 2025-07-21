import React from 'react';
import { Typography, Card, CardContent, Divider } from '@mui/material';

const ViewProfile = ({ profileData }) => {
  if (!profileData) {
    return <Typography fontWeight={300}>Loading...</Typography>;
  }

  return (
    <Card sx={{ 
      maxWidth: 900, 
      margin: '0 auto', 
      mt: 4, 
      boxShadow: 3,
      borderRadius: 2
    }}>
      <CardContent>
        <Typography 
          variant="h5" 
          gutterBottom 
          sx={{ 
            textAlign: 'center', 
            mb: 3, 
            fontWeight: 400,
            letterSpacing: 0.5
          }}
        >
          Profile Summary
        </Typography>
        
        <Divider sx={{ mb: 3 }} />

        <div className="container-fluid">
          <div className="row">
            {/* Column 1 - Personal Information */}
            <div className="col-md-6">
              <div className="mb-4">
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    mb: 2, 
                    color: 'text.secondary',
                    fontWeight: 400,
                    fontSize: '1.1rem',
                    textTransform: 'uppercase',
                    letterSpacing: 1
                  }}
                >
                  Personal Information
                </Typography>
                <div className="row mb-2">
                  <div className="col-5 text-muted">Full Name</div>
                  <div className="col-7" style={{ fontWeight: 300 }}>{profileData.fullName}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-5 text-muted">Age</div>
                  <div className="col-7" style={{ fontWeight: 300 }}>{profileData.age}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-5 text-muted">Gender</div>
                  <div className="col-7" style={{ fontWeight: 300 }}>{profileData.gender}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-5 text-muted">Height</div>
                  <div className="col-7" style={{ fontWeight: 300 }}>{profileData.height}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-5 text-muted">Weight</div>
                  <div className="col-7" style={{ fontWeight: 300 }}>{profileData.weight}</div>
                </div>
              </div>

              <div className="mb-4">
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    mb: 2, 
                    color: 'text.secondary',
                    fontWeight: 400,
                    fontSize: '1.1rem',
                    textTransform: 'uppercase',
                    letterSpacing: 1
                  }}
                >
                  Health & Goals
                </Typography>
                <div className="row mb-2">
                  <div className="col-5 text-muted">Goal</div>
                  <div className="col-7" style={{ fontWeight: 300 }}>{profileData.goal}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-5 text-muted">Activity Level</div>
                  <div className="col-7" style={{ fontWeight: 300 }}>{profileData.activityLevel}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-5 text-muted">Medical Conditions</div>
                  <div className="col-7" style={{ fontWeight: 300 }}>
                    {Array.isArray(profileData.medicalConditions)
                      ? profileData.medicalConditions.join(', ') || 'None'
                      : profileData.medicalConditions || 'None'}
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2 - Dietary Preferences */}
            <div className="col-md-6">
              <div className="mb-4">
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    mb: 2, 
                    color: 'text.secondary',
                    fontWeight: 400,
                    fontSize: '1.1rem',
                    textTransform: 'uppercase',
                    letterSpacing: 1
                  }}
                >
                  Dietary Preferences
                </Typography>
                <div className="row mb-2">
                  <div className="col-5 text-muted">Diet Type</div>
                  <div className="col-7" style={{ fontWeight: 300 }}>{profileData.dietType}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-5 text-muted">Cultural Preference</div>
                  <div className="col-7" style={{ fontWeight: 300 }}>{profileData.culturalPreference}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-5 text-muted">Religious Restrictions</div>
                  <div className="col-7" style={{ fontWeight: 300 }}>{profileData.religiousRestrictions}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-5 text-muted">Disliked Foods</div>
                  <div className="col-7" style={{ fontWeight: 300 }}>
                    {Array.isArray(profileData.dislikedFoods)
                      ? profileData.dislikedFoods.join(', ') || 'None'
                      : profileData.dislikedFoods || 'None'}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    mb: 2, 
                    color: 'text.secondary',
                    fontWeight: 400,
                    fontSize: '1.1rem',
                    textTransform: 'uppercase',
                    letterSpacing: 1
                  }}
                >
                  Meal Schedule
                </Typography>
                <div className="row mb-2">
                  <div className="col-5 text-muted">Meals Per Day</div>
                  <div className="col-7" style={{ fontWeight: 300 }}>{profileData.mealsPerDay}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-5 text-muted">Breakfast Time</div>
                  <div className="col-7" style={{ fontWeight: 300 }}>{profileData.breakfastTime || 'N/A'}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-5 text-muted">Lunch Time</div>
                  <div className="col-7" style={{ fontWeight: 300 }}>{profileData.lunchTime || 'N/A'}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-5 text-muted">Dinner Time</div>
                  <div className="col-7" style={{ fontWeight: 300 }}>{profileData.dinnerTime || 'N/A'}</div>
                </div>
              </div>

              
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ViewProfile;