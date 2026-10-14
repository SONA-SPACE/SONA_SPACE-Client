import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  message: string;
  agreeToTerms: boolean;
}

interface Experience {
  position: string;
  company: string;
  location: string;
  period: string;
  achievements: string[];
}

interface Skill {
  category: string;
  items: string[];
}

interface Education {
  university: string;
  degree: string;
  location: string;
}

interface Recommendation {
  text: string;
  author: string;
  position?: string;
}

const ContactFormArch: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    message: "",
    agreeToTerms: false
  });

  // Resume data
  const experiences: Experience[] = [
    {
      position: "Senior Producer",
      company: "Creative Agency XYZ",
      location: "Remote & New York, NY",
      period: "January 2022 - Present",
      achievements: [
        "Successfully facilitate diverse creative experiences: from immersive installations to cinematic narratives. A catalyst for collaboration across all mediums.",
        "Clients include: Loerrena, OnTwelve, Cyrx, Forgecloud and more."
      ]
    },
    {
      position: "Senior Producer",
      company: "Pixel Studios",
      location: "New York, NY",
      period: "December 2017 - June 2022",
      achievements: [
        "Orchestrated the creation of integrated video, motion, and photo content for multi-platform marketing campaigns, ensuring seamless execution and brand alignment.",
        "Directed all facets of production management: resource allocation, vendor negotiations, meticulously managing budgets, contracts, and legal requirements to deliver projects on time and within quality standards.",
        "Strategically developed and managed production schedules, creative strategies, and talent solutions, optimizing resources to deliver high-quality content within budget parameters.",
        "Clients include: Netflix, Benton, Polaroid, Vizio and more."
      ]
    },
    {
      position: "Content Producer",
      company: "Creative Hub Studios",
      location: "Los Angeles, CA",
      period: "January 2015 - November 2017",
      achievements: [
        "Facilitated seamless communication and coordination across cross-functional teams (Marketing, Brand, Creative, UX), ensuring seamless collaboration and project alignment.",
        "Proactively identified and integrated industry trends, emerging technologies, and cultural insights to enhance creative output and maintain brand relevance.",
        "Clients include: Loerrena, Forgecloud and more."
      ]
    }
  ];

  const skills: Skill[] = [
    {
      category: "Project Management",
      items: [
        "Budget Management & Forecasting",
        "Timeline Development & Execution",
        "Vendor & Contract Negotiation",
        "On-Site Production Management"
      ]
    },
    {
      category: "Strategic & Creative Oversight",
      items: [
        "Creative Strategy Development",
        "Talent Relations & Management",
        "Creative Direction Oversight",
        "Brand Alignment"
      ]
    },
    {
      category: "Communication & Collaboration",
      items: [
        "Cross-Functional Team Leadership",
        "Client Relationship Management",
        "Stakeholder Communication"
      ]
    }
  ];

  const education: Education = {
    university: "University of California, Los Angeles (UCLA)",
    degree: "Bachelor of Fine Arts in Graphic Design",
    location: "Honor Scale (Praiseworthy)"
  };

  const recommendations: Recommendation[] = [
    {
      text: "Alexandra brings sunshine to creative teams. Her optimism, problem-solving, and clear communication drive success.",
      author: "Michael Chen",
      position: "Creative Director, Agency XYZ"
    },
    {
      text: "Alexandra is hungry to tackle new challenges. She's delightful with clients and can diffuse a tense room with her laugh.",
      author: "Creative Director, Channel Agency XYZ"
    }
  ];

  const certification = {
    name: "Safe Sets International - COVID-19 Level Production Safety",
    year: "2020"
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // console.log("Form submitted:", formData);
    // Here you would typically send the data to your backend
    toast.success("Cảm ơn bạn đã gửi yêu cầu. Chúng tôi sẽ liên hệ với bạn sớm nhất có thể!");
  };

  return (
    <>
      <div className="architect-resume-page">
        {/* Introduction Section */}
        <section className="intro-section">
          <div className="container">
            <div className="intro-content">
              <div className="personal-info">
                <h1>A seasoned Senior Producer with 10+ years of experience, I excel in leading complex marketing and design projects from concept to completion.</h1>
                <div className="contact-details">
                  <div className="contact-item">
                    <label>hello@gmail.com</label>
                  </div>
                  <div className="contact-item">
                    <label>(555) 123-4567</label>
                  </div>
                  <div className="contact-item">
                    <label>LinkedIn</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section className="experience-section">
          <div className="container">
            <h2 className="section-title">Experience</h2>
            
            {experiences.map((exp, index) => (
              <div className="experience-item" data-reveal key={index}>
                <div className="experience-header">
                  <div className="position-company">
                    <h3>{exp.position}</h3>
                    <p className="company">{exp.company} {exp.location && <span>•</span>} {exp.location}</p>
                  </div>
                  <p className="period">{exp.period}</p>
                </div>
                <div className="achievements">
                  {exp.achievements.map((achievement, i) => (
                    <p key={i}>{achievement}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills Section */}
        <section className="skills-section">
          <div className="container">
            <h2 className="section-title">Skills</h2>
            
            <div className="skills-grid">
              {skills.map((skillCategory, index) => (
                <div className="skill-category" data-reveal key={index}>
                  <h3>{skillCategory.category}</h3>
                  <ul>
                    {skillCategory.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Communication & Collaboration Section */}
        <section className="communication-section">
          <div className="container">
            <h2 className="section-title">Communication & Collaboration</h2>
            
            <div className="communication-grid">
              {skills[2].items.map((item, index) => (
                <div className="communication-item" data-reveal key={index}>
                  <h4>• {item}</h4>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Education Section */}
        <section className="education-section">
          <div className="container">
            <h2 className="section-title">Education</h2>
            
            <div className="education-content">
              <h3>{education.university}</h3>
              <p>{education.degree}</p>
              <p className="honor">{education.location}</p>
            </div>
          </div>
        </section>

        {/* Recommendations Section */}
        <section className="recommendations-section">
          <div className="container">
            <h2 className="section-title">Recommendations</h2>
            
            <div className="recommendations-grid">
              {recommendations.map((rec, index) => (
                <div className="recommendation-item" data-reveal key={index}>
                  <p className="quote">"{rec.text}"</p>
                  <p className="author">{rec.author}</p>
                  {rec.position && <p className="position">{rec.position}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Certifications Section */}
        <section className="certifications-section">
          <div className="container">
            <h2 className="section-title">Certifications</h2>
            
            <div className="certification-content">
              <p>{certification.name} - {certification.year}</p>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="contact-form-section">
          <div className="container">
            <h2 className="section-title">Get in Touch</h2>
            
            <form className="arch-contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input 
                  type="text" 
                  id="fullName" 
                  name="fullName" 
                  value={formData.fullName} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea 
                  id="message" 
                  name="message" 
                  rows={5} 
                  value={formData.message} 
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              
              <div className="form-group checkbox-group">
                <input 
                  type="checkbox" 
                  id="agreeToTerms" 
                  name="agreeToTerms" 
                  checked={formData.agreeToTerms} 
                  onChange={handleCheckboxChange} 
                  required 
                />
                <label htmlFor="agreeToTerms">
                  I agree to the terms and privacy policy
                </label>
              </div>
              
              <button type="submit" className="submit-btn">Send</button>
            </form>
          </div>
        </section>

        {/* Design Showcase */}
        <section className="design-showcase">
          <div className="container">
            <div className="showcase-grid">
              <div className="showcase-item">
                <img src="/images/design/personalized-design.jpg" alt="Thiết kế cá nhân hóa" />
                <h3>Thiết kế cá nhân hóa</h3>
                <p>Liên hệ ngay để tư vấn</p>
              </div>
              
              <div className="showcase-item">
                <img src="/images/design/material-samples.jpg" alt="Tìm hiểu về các mẫu vật liệu" />
                <h3>Tìm hiểu thêm về các mẫu vật liệu</h3>
              </div>
              
              <div className="showcase-item">
                <img src="/images/design/design-consultation.jpg" alt="Bạn cần tư vấn thiết kế?" />
                <h3>Bạn cần liên hệ hỗ trợ?</h3>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ContactFormArch;
