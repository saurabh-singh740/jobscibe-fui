import React, { useEffect, useState } from "react";
import ResumeUpload from "../components/ResumeUpload";
import OptimiseResume from "../components/Resume/OptimiseResume";
import KeywordMatch from "../components/keywordMatch";
import axios from "axios";

// Backend base URL
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
    const title = jobTitle.trim();
    const location = jobLocation.trim() || "remote";

    if (title.length < 2) {
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
            query: title,
            location,
          },
        }
      );

      if (res.data?.success && Array.isArray(res.data.data)) {
        setJobs(res.data.data);

        if (res.data.data.length === 0) {
          setJobError("No jobs found for this search.");
        }
      } else {
        setJobs([]);
        setJobError("Unexpected response from server.");
      }
    } catch (err) {
      console.error("Job fetch error:", err.response?.data || err);

      setJobError(
        err.response?.data?.error?.message ||
          "Failed to fetch jobs. Try again."
      );
      setJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  };

  const features = [
    {
      title: "Resume Parsing",
      description:
        "Instantly extract key details from your CV to make it recruiter-ready.",
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
      description:
        "Enhance your resume for better alignment with job requirements.",
      component: (
        <OptimiseResume
          resumeId={resumeId}
          parsedSkills={parsedSkills}
        />
      ),
    },
    {
      title: "Keyword Matching",
      description:
        "Check how well your resume matches job keywords to boost shortlisting.",
      component: (
        <KeywordMatch
          parsedSkills={parsedSkills}
          parsedText={parsedText}
        />
      ),
    },
    {
      title: "Job Search",
      description: "Find relevant jobs and directly apply from the list.",
      component: isAuthenticated ? (
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row gap-2">
            <input
              type="text"
              placeholder="Job title or keywords..."
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="flex-1 p-2 rounded-md border"
            />
            <input
              type="text"
              placeholder="Location (default: remote)"
              value={jobLocation}
              onChange={(e) => setJobLocation(e.target.value)}
              className="flex-1 p-2 rounded-md border"
            />
          </div>

          <button
            onClick={fetchExternalJobs}
            className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-500"
          >
            {loadingJobs ? "Searching..." : "Search Jobs"}
          </button>

          {jobError && (
            <p className="text-red-500 text-sm">{jobError}</p>
          )}

          <div className="max-h-[400px] overflow-y-auto space-y-3">
            {jobs.map((job, idx) => (
              <div
                key={idx}
                className="p-4 border rounded bg-white"
              >
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
        <p className="text-red-500 font-medium">
          Login/Register to search jobs.
        </p>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-16 px-6">
      <h2 className="text-4xl font-bold text-center text-white mb-12">
        Explore Jobscribe Features
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {features.map((feature, i) => (
          <div
            key={i}
            className="p-6 bg-indigo-100/80 rounded-2xl shadow-xl"
          >
            <h3 className="text-xl font-semibold mb-3">
              {feature.title}
            </h3>
            <p className="mb-4 text-gray-700">
              {feature.description}
            </p>
            {feature.component}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;
