import { useState } from "react";
import { Wand2, Plus, Trash2, AlertCircle } from "lucide-react";

export function ResumeGenerator({
  jobDescription,
  onJobDescriptionChange,
  profile,
  onProfileChange,
  experiences,
  onExperiencesChange,
  projects,
  onProjectsChange,
  skills,
  onSkillsChange,
  education,
  onEducationChange,
  onGenerate,
  isLoading,
}) {

  const [activeTab, setActiveTab] = useState("jd");

  const addExperience = () => {
    onExperiencesChange([
      ...experiences,
      { company: "", position: "", duration: "", description: "" },
    ]);
  };

  const removeExperience = (index) => {
    onExperiencesChange(experiences.filter((_, i) => i !== index));
  };

  const updateExperience = (index, field, value) => {
    const updated = [...experiences];
    updated[index][field] = value;
    onExperiencesChange(updated);
  };

  const addProject = () => {
    onProjectsChange([
      ...projects,
      { title: "", description: "", technologies: "", link: "" },
    ]);
  };

  const removeProject = (index) => {
    onProjectsChange(projects.filter((_, i) => i !== index));
  };

  const updateProject = (index, field, value) => {
    const updated = [...projects];
    updated[index][field] = value;
    onProjectsChange(updated);
  };

  const addEducation = () => {
    onEducationChange([
      ...education,
      { institution: "", degree: "", field: "", year: "" },
    ]);
  };

  const removeEducation = (index) => {
    onEducationChange(education.filter((_, i) => i !== index));
  };

  const updateEducation = (index, field, value) => {
    const updated = [...education];
    updated[index][field] = value;
    onEducationChange(updated);
  };

  const addSkill = () => {
    const skill = prompt("Enter a skill:");
    if (skill && skill.trim()) {
      onSkillsChange([...skills, skill.trim()]);
    }
  };

  const removeSkill = (index) => {
    onSkillsChange(skills.filter((_, i) => i !== index));
  };

  const tabs = [
    { id: "jd", label: "Job Description" },
    { id: "profile", label: "Profile" },
    { id: "experience", label: "Experience" },
    { id: "projects", label: "Projects" },
    { id: "skills", label: "Skills" },
    { id: "education", label: "Education" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">

        {activeTab === "jd" && (
          <textarea
            value={jobDescription}
            onChange={(e) => onJobDescriptionChange(e.target.value)}
            placeholder="Paste Job Description..."
            className="w-full h-40 p-4 border border-gray-300 rounded-lg"
          />
        )}

        {activeTab === "profile" && (
          <div className="space-y-4">
            <input
              type="text"
              value={profile.fullName}
              onChange={(e) =>
                onProfileChange({ ...profile, fullName: e.target.value })
              }
              placeholder="Full Name"
              className="w-full px-4 py-2 border rounded-lg"
            />

            <input
              type="email"
              value={profile.email}
              onChange={(e) =>
                onProfileChange({ ...profile, email: e.target.value })
              }
              placeholder="Email"
              className="w-full px-4 py-2 border rounded-lg"
            />

            <input
              type="tel"
              value={profile.phone}
              onChange={(e) =>
                onProfileChange({ ...profile, phone: e.target.value })
              }
              placeholder="Phone"
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        )}

        {activeTab === "experience" && (
          <div className="space-y-4">
            {experiences.map((exp, index) => (
              <div key={index} className="border p-4 rounded-lg">

                <input
                  value={exp.company}
                  onChange={(e) =>
                    updateExperience(index, "company", e.target.value)
                  }
                  placeholder="Company"
                  className="w-full border p-2 mb-2"
                />

                <input
                  value={exp.position}
                  onChange={(e) =>
                    updateExperience(index, "position", e.target.value)
                  }
                  placeholder="Position"
                  className="w-full border p-2 mb-2"
                />

                <textarea
                  value={exp.description}
                  onChange={(e) =>
                    updateExperience(index, "description", e.target.value)
                  }
                  placeholder="Description"
                  className="w-full border p-2"
                />

                <button
                  onClick={() => removeExperience(index)}
                  className="text-red-600 mt-2"
                >
                  <Trash2 size={16} />
                </button>

              </div>
            ))}

            <button onClick={addExperience} className="flex gap-2 text-blue-600">
              <Plus size={16} />
              Add Experience
            </button>
          </div>
        )}

      </div>

      {/* Generate Button */}
      <div className="px-6 py-4 border-t border-gray-200 flex gap-3">

        {(!jobDescription || !profile.fullName || !profile.email) && (
          <div className="flex gap-2 text-yellow-700 bg-yellow-50 p-3 rounded-lg flex-1">
            <AlertCircle size={16} />
            Fill Job Description, Name & Email
          </div>
        )}

        <button
          onClick={onGenerate}
          disabled={isLoading || !jobDescription || !profile.fullName || !profile.email}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          <Wand2 size={18} />
          {isLoading ? "Generating..." : "Generate Resume"}
        </button>

      </div>
    </div>
  );
}