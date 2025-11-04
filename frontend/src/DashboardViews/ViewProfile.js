import React, { useState } from 'react';
import { Typography, Card, CardContent, Divider, Button, TextField, Snackbar, Alert } from '@mui/material';
import axios from 'axios';

const ViewProfile = ({ profileData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState(profileData);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  if (!profileData) {
    return <Typography fontWeight={300}>Loading...</Typography>;
  }

  const handleChange = (field, value) => {
    setEditableData({ ...editableData, [field]: value });
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:5000/api/profile/${profileData.id}`, editableData); // send updated data to backend
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: 'Failed to update profile.', severity: 'error' });
    }
  };

  return (
    <>
      <Card sx={{ maxWidth: 900, margin: '0 auto', mt: 4, boxShadow: 3, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 3, fontWeight: 400, letterSpacing: 0.5 }}>
            Profile Summary
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <div className="container-fluid">
            <div className="row">
              {/* Column 1 - Personal Information */}
              <div className="col-md-6">
                <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary', fontWeight: 400, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Personal Information
                </Typography>

                {['fullName', 'age', 'gender', 'height', 'weight'].map((field) => (
                  <div className="row mb-2" key={field}>
                    <div className="col-5 text-muted">{field.replace(/([A-Z])/g, ' $1')}</div>
                    <div className="col-7">
                      {isEditing ? (
                        <TextField
                          variant="outlined"
                          size="small"
                          fullWidth
                          value={editableData[field] || ''}
                          onChange={(e) => handleChange(field, e.target.value)}
                        />
                      ) : (
                        <span style={{ fontWeight: 300 }}>{profileData[field]}</span>
                      )}
                    </div>
                  </div>
                ))}

                <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, color: 'text.secondary', fontWeight: 400, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Health & Goals
                </Typography>

                {['goal', 'activityLevel', 'medicalConditions'].map((field) => (
                  <div className="row mb-2" key={field}>
                    <div className="col-5 text-muted">{field.replace(/([A-Z])/g, ' $1')}</div>
                    <div className="col-7">
                      {isEditing ? (
                        <TextField
                          variant="outlined"
                          size="small"
                          fullWidth
                          value={Array.isArray(editableData[field]) ? editableData[field].join(', ') : editableData[field] || ''}
                          onChange={(e) =>
                            handleChange(
                              field,
                              field === 'medicalConditions' ? e.target.value.split(',').map((item) => item.trim()) : e.target.value
                            )
                          }
                        />
                      ) : (
                        <span style={{ fontWeight: 300 }}>
                          {Array.isArray(profileData[field]) ? profileData[field].join(', ') || 'None' : profileData[field] || 'None'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Column 2 - Dietary Preferences */}
              <div className="col-md-6">
                <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary', fontWeight: 400, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Dietary Preferences
                </Typography>

                {['dietType', 'allergies', 'religiousRestrictions', 'dislikedFoods'].map((field) => (
                  <div className="row mb-2" key={field}>
                    <div className="col-5 text-muted">{field.replace(/([A-Z])/g, ' $1')}</div>
                    <div className="col-7">
                      {isEditing ? (
                        <TextField
                          variant="outlined"
                          size="small"
                          fullWidth
                          value={Array.isArray(editableData[field]) ? editableData[field].join(', ') : editableData[field] || ''}
                          onChange={(e) =>
                            handleChange(
                              field,
                              Array.isArray(editableData[field]) ? e.target.value.split(',').map((item) => item.trim()) : e.target.value
                            )
                          }
                        />
                      ) : (
                        <span style={{ fontWeight: 300 }}>
                          {Array.isArray(profileData[field]) ? profileData[field].join(', ') || 'None' : profileData[field] || 'None'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, color: 'text.secondary', fontWeight: 400, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Meal Schedule
                </Typography>

                {['mealsPerDay', 'breakfastTime', 'lunchTime', 'dinnerTime'].map((field) => (
                  <div className="row mb-2" key={field}>
                    <div className="col-5 text-muted">{field.replace(/([A-Z])/g, ' $1')}</div>
                    <div className="col-7">
                      {isEditing ? (
                        <TextField
                          variant="outlined"
                          size="small"
                          fullWidth
                          value={editableData[field] || ''}
                          onChange={(e) => handleChange(field, e.target.value)}
                        />
                      ) : (
                        <span style={{ fontWeight: 300 }}>{profileData[field] || 'N/A'}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Divider sx={{ my: 2 }} />

          <div style={{ textAlign: 'center' }}>
            {isEditing ? (
              <>
                <Button variant="contained" color="primary" sx={{ mr: 2 }} onClick={handleSave}>
                  Save
                </Button>
                <Button variant="outlined" color="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="contained" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ViewProfile;
