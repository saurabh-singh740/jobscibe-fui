import React, { useEffect, useState } from "react";
import ResumeUpload from "../components/ResumeUpload";
import OptimiseResume from "../components/Resume/OptimiseResume";
import KeywordMatch from "../components/keywordMatch";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://jobscibe.onrender.com";

const Features = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [resumeId, setResumeId] = useState(null);
  const [parsedSkills, setParsedSkills] = useState([]);
  const [parsedText, setParsedText] = useState("");

  // Job search states
  const [jobs, setJobs] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [jobLocation, setJobLocation] = useState("remote");
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobError, setJobError] = useState("");

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("token"));
  }, []);

  const fetchExternalJobs = async () => {
    if (!jobTitle || jobTitle.trim().length < 2) {
      setJobError("Enter a valid job title (min 2 characters)");
      setJobs([]);
      return;
    }

    try {
      setLoadingJobs(true);
      setJobError("");

      const res = await axios.get(
        `${API_BASE_URL}/api/jobs/external`,
        {
          params: {
            query: jobTitle.trim(),
            location: jobLocation?.trim() || "remote",
          },
        }
      );

      if (res.data?.success) {
        setJobs(res.data.data || []);
        if (!res.data.data?.length) {
          setJobError("No jobs found.");
        }
      } else {
        setJobs([]);
        setJobError("Unexpected response from server.");
      }
    } catch (err) {
      console.error("Job fetch error:", err.response?.data || err);
      setJobError("Failed to fetch jobs. Try again.");
      setJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  };

  const features = [
    {
      title: "Resume Parsing",
      description: "Instantly extract key details from your CV.",
      component: (
        <ResumeUpload
          setResumeId={setResumeId}
          setParsedSkills={setParsedSkills}
          setParsedText={setParsedText}
        />
      ),
    },
    {
      title: "Optimise Resume",
      description: "Enhance resume alignment with job requirements.",
      component: (
        <OptimiseResume resumeId={resumeId} parsedSkills={parsedSkills} />
      ),
    },
    {
      title: "Keyword Matching",
      description: "Check how well your resume matches job keywords.",
      component: (
        <KeywordMatch
          parsedSkills={parsedSkills}
          parsedText={parsedText}
        />
      ),
    },
    {
      title: "Job Search",
      description: "Find relevant jobs and apply directly.",
      component: isAuthenticated ? (
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row gap-2">
            <input
              type="text"
              placeholder="Job title or keywords..."
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="flex-1 p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Location (default: remote)"
              value={jobLocation}
              onChange={(e) => setJobLocation(e.target.value)}
              className="flex-1 p-2 border rounded"
            />
          </div>

          <button
            onClick={fetchExternalJobs}
            className="bg-indigo-600 text-white py-2 px-6 rounded"
          >
            {loadingJobs ? "Searching..." : "Search Jobs"}
          </button>

          {jobError && <p className="text-red-500 text-sm">{jobError}</p>}

          <div className="max-h-[400px] overflow-y-auto space-y-3">
            {jobs.map((job, idx) => (
              <div key={idx} className="p-4 bg-white border rounded">
                <p className="font-semibold">{job.title}</p>
                <p className="text-sm">{job.company}</p>
                <p className="text-xs text-gray-500">
                  {job.location} | {job.type || "N/A"} |{" "}
                  {job.salary || "N/A"}
                </p>
                <div
                  className="text-sm text-gray-600"
                  dangerouslySetInnerHTML={{ __html: job.snippet }}
                />
                <a
                  href={job.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 text-sm underline"
                >
                  Apply Now
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-red-500">Login/Register to search jobs.</p>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-16 px-6">
      <h2 className="text-4xl font-bold text-center text-white mb-12">
        Explore Jobscribe Features
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {features.map((f, i) => (
          <div key={i} className="p-6 bg-indigo-100 rounded-2xl shadow">
            <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
            <p className="mb-4">{f.description}</p>
            {f.component}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;
