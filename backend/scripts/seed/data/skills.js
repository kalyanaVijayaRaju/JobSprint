/**
 * Skill pools mapped to job roles for realistic seed data.
 * Each role has required skills and preferred/bonus skills.
 */

export const skillsByRole = {
  'Node.js Developer': {
    required: ['Node.js', 'Express.js', 'JavaScript', 'REST APIs', 'MongoDB'],
    preferred: ['TypeScript', 'GraphQL', 'Redis', 'Docker', 'Microservices', 'PostgreSQL', 'RabbitMQ', 'Jest', 'CI/CD', 'AWS'],
  },
  'React Developer': {
    required: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Redux'],
    preferred: ['TypeScript', 'Next.js', 'React Query', 'Tailwind CSS', 'Jest', 'Cypress', 'Storybook', 'Figma', 'Webpack', 'GraphQL'],
  },
  'MERN Stack Developer': {
    required: ['MongoDB', 'Express.js', 'React', 'Node.js', 'JavaScript'],
    preferred: ['TypeScript', 'Redux', 'Docker', 'AWS', 'GraphQL', 'Redis', 'Jest', 'CI/CD', 'Nginx', 'Git'],
  },
  'Backend Developer': {
    required: ['Node.js', 'Python', 'REST APIs', 'SQL', 'Git'],
    preferred: ['Docker', 'Kubernetes', 'Redis', 'RabbitMQ', 'PostgreSQL', 'MongoDB', 'Microservices', 'CI/CD', 'AWS', 'Linux'],
  },
  'Frontend Developer': {
    required: ['JavaScript', 'HTML5', 'CSS3', 'React', 'Git'],
    preferred: ['TypeScript', 'Vue.js', 'Angular', 'Sass', 'Webpack', 'Responsive Design', 'REST APIs', 'Jest', 'Figma', 'Performance Optimization'],
  },
  'Full Stack Developer': {
    required: ['JavaScript', 'React', 'Node.js', 'SQL', 'Git'],
    preferred: ['TypeScript', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS', 'CI/CD', 'Redis', 'GraphQL', 'Next.js', 'Microservices'],
  },
  'Java Developer': {
    required: ['Java', 'Spring Boot', 'REST APIs', 'SQL', 'Maven'],
    preferred: ['Microservices', 'Hibernate', 'Kafka', 'Docker', 'Kubernetes', 'JUnit', 'AWS', 'PostgreSQL', 'Redis', 'CI/CD'],
  },
  'Python Developer': {
    required: ['Python', 'Django', 'REST APIs', 'SQL', 'Git'],
    preferred: ['Flask', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker', 'Celery', 'AWS', 'Unit Testing', 'CI/CD', 'Microservices'],
  },
  'Go Developer': {
    required: ['Go', 'REST APIs', 'SQL', 'Git', 'Linux'],
    preferred: ['gRPC', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis', 'Microservices', 'Kafka', 'Prometheus', 'CI/CD', 'AWS'],
  },
  'Rust Developer': {
    required: ['Rust', 'Systems Programming', 'Git', 'Linux', 'Data Structures'],
    preferred: ['Tokio', 'WebAssembly', 'C/C++', 'Docker', 'Kubernetes', 'PostgreSQL', 'gRPC', 'Performance Optimization', 'CI/CD', 'AWS'],
  },
  'Flutter Developer': {
    required: ['Flutter', 'Dart', 'Mobile Development', 'REST APIs', 'Git'],
    preferred: ['Firebase', 'State Management', 'iOS', 'Android', 'CI/CD', 'Unit Testing', 'Figma', 'GraphQL', 'Hive', 'Bloc Pattern'],
  },
  'Android Developer': {
    required: ['Android', 'Kotlin', 'Java', 'Android SDK', 'Git'],
    preferred: ['Jetpack Compose', 'MVVM', 'Retrofit', 'Dagger/Hilt', 'Room Database', 'Firebase', 'CI/CD', 'Coroutines', 'Unit Testing', 'Material Design'],
  },
  'iOS Developer': {
    required: ['iOS', 'Swift', 'Xcode', 'UIKit', 'Git'],
    preferred: ['SwiftUI', 'CoreData', 'Combine', 'CocoaPods', 'Alamofire', 'MVVM', 'CI/CD', 'Unit Testing', 'App Store', 'ARKit'],
  },
  'DevOps Engineer': {
    required: ['Docker', 'Kubernetes', 'CI/CD', 'Linux', 'AWS'],
    preferred: ['Terraform', 'Ansible', 'Jenkins', 'GitLab CI', 'Prometheus', 'Grafana', 'Helm', 'Python', 'Bash', 'ArgoCD'],
  },
  'Cloud Engineer': {
    required: ['AWS', 'Cloud Architecture', 'Docker', 'Linux', 'Networking'],
    preferred: ['Azure', 'GCP', 'Terraform', 'Kubernetes', 'Serverless', 'CloudFormation', 'IAM', 'VPC', 'Lambda', 'Cost Optimization'],
  },
  'SRE': {
    required: ['Linux', 'Kubernetes', 'Monitoring', 'CI/CD', 'Python'],
    preferred: ['Prometheus', 'Grafana', 'Terraform', 'Docker', 'AWS', 'SLO/SLI', 'Incident Management', 'Ansible', 'Go', 'Chaos Engineering'],
  },
  'AI Engineer': {
    required: ['Python', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch'],
    preferred: ['NLP', 'Computer Vision', 'LLM', 'Hugging Face', 'MLOps', 'Docker', 'AWS SageMaker', 'Transformers', 'ONNX', 'LangChain'],
  },
  'ML Engineer': {
    required: ['Python', 'Machine Learning', 'Scikit-learn', 'SQL', 'Statistics'],
    preferred: ['TensorFlow', 'PyTorch', 'MLflow', 'Feature Engineering', 'AWS', 'Docker', 'Spark', 'A/B Testing', 'Kubeflow', 'Data Pipelines'],
  },
  'Data Engineer': {
    required: ['Python', 'SQL', 'Apache Spark', 'ETL', 'Data Warehousing'],
    preferred: ['Airflow', 'Kafka', 'AWS', 'Snowflake', 'Databricks', 'dbt', 'Hadoop', 'Docker', 'Data Modeling', 'CI/CD'],
  },
  'QA Engineer': {
    required: ['Manual Testing', 'Test Planning', 'Bug Tracking', 'SQL', 'API Testing'],
    preferred: ['Selenium', 'Postman', 'Jira', 'Agile', 'Performance Testing', 'Security Testing', 'Test Automation', 'CI/CD', 'JMeter', 'Cypress'],
  },
  'SDET': {
    required: ['Test Automation', 'Java', 'Selenium', 'REST API Testing', 'Git'],
    preferred: ['Cypress', 'Playwright', 'JUnit', 'TestNG', 'Docker', 'CI/CD', 'Performance Testing', 'Python', 'Postman', 'BDD'],
  },
  'UI Developer': {
    required: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design', 'Git'],
    preferred: ['Sass', 'Bootstrap', 'Figma', 'Accessibility', 'Cross-Browser Testing', 'Animation', 'React', 'Performance Optimization', 'Tailwind CSS', 'SEO'],
  },
  'Angular Developer': {
    required: ['Angular', 'TypeScript', 'HTML5', 'CSS3', 'RxJS'],
    preferred: ['NgRx', 'Angular Material', 'Jest', 'Cypress', 'REST APIs', 'GraphQL', 'Webpack', 'Node.js', 'SCSS', 'PWA'],
  },
  'Vue Developer': {
    required: ['Vue.js', 'JavaScript', 'HTML5', 'CSS3', 'Git'],
    preferred: ['Vuex', 'Pinia', 'Nuxt.js', 'TypeScript', 'Tailwind CSS', 'REST APIs', 'Jest', 'Cypress', 'Webpack', 'GraphQL'],
  },
  'Cyber Security Engineer': {
    required: ['Network Security', 'SIEM', 'Vulnerability Assessment', 'Linux', 'Firewalls'],
    preferred: ['Penetration Testing', 'SOC', 'Incident Response', 'AWS Security', 'Python', 'Cloud Security', 'Zero Trust', 'OWASP', 'Compliance', 'Forensics'],
  },
  'Product Manager': {
    required: ['Product Strategy', 'Agile', 'Roadmapping', 'User Research', 'Data Analysis'],
    preferred: ['Jira', 'SQL', 'A/B Testing', 'Wireframing', 'Stakeholder Management', 'OKRs', 'Market Research', 'PRD Writing', 'Analytics', 'Figma'],
  },
  'Data Scientist': {
    required: ['Python', 'Statistics', 'Machine Learning', 'SQL', 'Data Visualization'],
    preferred: ['R', 'Pandas', 'NumPy', 'Tableau', 'Power BI', 'Deep Learning', 'NLP', 'A/B Testing', 'Jupyter', 'Scikit-learn'],
  },
};

/**
 * Flat list of all unique skills for candidate profile generation.
 */
export const allSkills = [...new Set(
  Object.values(skillsByRole).flatMap(({ required, preferred }) => [...required, ...preferred])
)];

/**
 * Experience levels with their weight distribution for job generation.
 */
export const experienceLevels = [
  { label: 'Fresher (0-1 years)', value: 'fresher', weight: 15 },
  { label: '1-3 Years', value: '1-3', weight: 30 },
  { label: '3-5 Years', value: '3-5', weight: 25 },
  { label: '5-8 Years', value: '5-8', weight: 20 },
  { label: '8+ Years', value: '8+', weight: 10 },
];

export default skillsByRole;
