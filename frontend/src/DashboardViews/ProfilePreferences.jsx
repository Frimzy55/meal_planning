import { useState } from 'react';
import { Box, Button, LinearProgress, Typography } from '@mui/material';
import axios from 'axios';
import ViewProfile from './ViewProfile'; // ← Import the new component


import Step1PersonalInfo from './Step1PersonalInfo';
import Step2HealthGoals from './Step2HealthGoals';
import Step3DietPreferences from './Step3DietPreferences';
import Step4MealSchedule from './Step4MealSchedule';

const TOTAL_STEPS = 4;

export default function ProfilePreferences() {
  
 const [submittedProfile, setSubmittedProfile] = useState(null);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
   id:'', fullName: '', age: '', gender: '', height: '', weight: '',
    goal: '', activityLevel: '', medicalConditions: [],
    dietType: '', culturalPreference: '', religiousRestrictions: '', dislikedFoods: '',
    mealsPerDay: '', mealTimes: { breakfast: '', lunch: '', dinner: '' }
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

  const handleSubmit = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/profile', formData);
      console.log(res.data); // 👈 add this to debug
      //alert(res.data.message);
      alert('success')
    } catch (err) {
      console.error(err);
      alert('Error saving profile');
    }
  };


 /* const handleViewProfile = async () => {
  try {
    const res = await axios.get(`http://localhost:5000/api/profile/${formData.id}`);
    alert(JSON.stringify(res.data, null, 2)); // or display it in a modal
  } catch (err) {
    console.error(err);
    alert('Error fetching submitted profile');
  }
};*/

const handleViewProfile = async () => {
  try {
    const res = await axios.get(`http://localhost:5000/api/profile/${formData.id}`);
    setSubmittedProfile(res.data); // 👈 Update state instead of using alert
  } catch (err) {
    console.error(err);
    alert('Error fetching submitted profile');
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
            onClick={() => setSubmittedProfile(null)} // 👈 Add a "Back to Form" option
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
  </Box>
);

}
