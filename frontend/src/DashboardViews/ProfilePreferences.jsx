//import { useState } from 'react';
import { useState } from 'react'; // ✅ already imported
import { Box, Button, LinearProgress, Typography, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import ViewProfile from './ViewProfile';

import Step1PersonalInfo from './Step1PersonalInfo';
import Step2HealthGoals from './Step2HealthGoals';
import Step3DietPreferences from './Step3DietPreferences';
import Step4MealSchedule from './Step4MealSchedule';

const TOTAL_STEPS = 4;

export default function ProfilePreferences() {
  const [submittedProfile, setSubmittedProfile] = useState(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    id: '', fullName: '', age: '', gender: '', height: '', weight: '',
    goal: '', activityLevel: '', medicalConditions: [],
    dietType: '', allergies: '', religiousRestrictions: '', dislikedFoods: '',
    mealsPerDay: '', mealTimes: { breakfast: '', lunch: '', dinner: '' }
  });


  /*useEffect(() => {
  const storedUser = JSON.parse(localStorage.getItem('user'));
  if (storedUser?.id) {
    setFormData(prev => ({ ...prev, id: storedUser.id }));
  }
}, []);*/

  // ✅ Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', // 'success' | 'error' | 'info' | 'warning'
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const toggleCheckbox = (field, value) => {
    const list = formData[field];
    const updated = list.includes(value)
      ? list.filter(v => v !== value)
      : [...list, value];
    handleChange(field, updated);
  };

  // ✅ Handle form submission with Snackbar
  // ✅ Handle form submission with Snackbar
const handleSubmit = async () => {
  try {
    const res = await axios.post('http://localhost:5000/api/profile', formData);
    console.log("✅ Server response:", res.data);

    setSnackbar({
      open: true,
      message: res.data?.message || "Profile saved successfully!",
      severity: "success",
    });

    // ✅ Reset the form to initial state
    setFormData({
      id: formData.id, // keep the user id so they can resubmit if needed
      fullName: '',
      age: '',
      gender: '',
      height: '',
      weight: '',
      goal: '',
      activityLevel: '',
      medicalConditions: [],
      dietType: '',
      culturalPreference: '',
      religiousRestrictions: '',
      dislikedFoods: '',
      mealsPerDay: '',
      mealTimes: { breakfast: '', lunch: '', dinner: '' }
    });

    // Reset to first step
    setStep(1);

  } catch (err) {
    console.error("❌ Error saving profile:", err);

    setSnackbar({
      open: true,
      message: err.response?.data?.message || "Error saving profile",
      severity: "error",
    });
  }
};


  const handleViewProfile = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/profile/${formData.id}`);
      setSubmittedProfile(res.data);
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: 'Error fetching submitted profile',
        severity: 'error',
      });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1PersonalInfo formData={formData} handleChange={handleChange} />;
      case 2:
        return <Step2HealthGoals formData={formData} handleChange={handleChange} toggleCheckbox={toggleCheckbox} />;
      case 3:
        return <Step3DietPreferences formData={formData} handleChange={handleChange} />;
      case 4:
        return <Step4MealSchedule formData={formData} handleChange={handleChange} handleNestedChange={handleNestedChange} />;
      default:
        return null;
    }
  };

  return (
    <Box className="flex-grow-1 p-4 overflow-auto">
      <Box className="bg-white rounded shadow-sm p-4">
        {/* If profile is submitted, show only the profile */}
        {submittedProfile ? (
          <>
            <ViewProfile profileData={submittedProfile} />
            <Button
              variant="outlined"
              color="secondary"
              sx={{ mt: 2 }}
              onClick={() => setSubmittedProfile(null)}
            >
              Back to Form
            </Button>
          </>
        ) : (
          <>
            {/* View Profile Button */}
            <Button
              variant="outlined"
              color="primary"
              sx={{ mb: 2 }}
              onClick={handleViewProfile}
            >
              View Submitted Profile
            </Button>

            {/* Step Label and Progress Bar */}
            <Box className="mb-4">
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'success' }}>
                Step {step} of {TOTAL_STEPS}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(step / TOTAL_STEPS) * 100}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  mt: 1,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'green'
                  },
                  backgroundColor: '#c8e6c9'
                }}
              />
            </Box>

            {/* Step Form */}
            {renderStep()}

            {/* Navigation Buttons */}
            <Box className="mt-4 d-flex justify-content-between">
              <Button
                variant="outlined"
                disabled={step === 1}
                onClick={() => setStep(step - 1)}
              >
                Back
              </Button>

              {step < TOTAL_STEPS ? (
                <Button variant="contained" color="success" onClick={() => setStep(step + 1)}>
                  Next
                </Button>
              ) : (
                <Button variant="contained" color="success" onClick={handleSubmit}>
                  Submit
                </Button>
              )}
            </Box>
          </>
        )}
      </Box>

      {/* ✅ Snackbar Component */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
