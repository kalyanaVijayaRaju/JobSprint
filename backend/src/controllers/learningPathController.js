import LearningPath from '../models/LearningPath.js';
import catchAsync from '../utils/catchAsync.js';

export const getLearningPaths = catchAsync(async (req, res) => {
  const paths = await LearningPath.find({ user: req.user._id }).sort({ createdAt: -1 });

  if (paths.length === 0) {
    // Seed initial demo paths if empty
    const seeded = [
      {
        _id: 'lp-seed-1',
        user: req.user._id,
        targetRole: 'Senior React / Full-Stack Engineer',
        skillGap: 'State Management & Performance Optimization',
        level: 'Intermediate',
        progress: 65,
        status: 'in-progress',
        modules: [
          { _id: 'm1', title: 'React Server Components & Next.js App Router', durationMinutes: 45, resourceType: 'video', resourceUrl: 'https://react.dev', isCompleted: true },
          { _id: 'm2', title: 'State Architecture with Zustand & Redux Toolkit', durationMinutes: 60, resourceType: 'article', resourceUrl: 'https://zustand-demo.pmnd.rs', isCompleted: true },
          { _id: 'm3', title: 'Web Vitals & Bundle Splitting Deep Dive', durationMinutes: 40, resourceType: 'interactive', resourceUrl: 'https://web.dev', isCompleted: false },
          { _id: 'm4', title: 'Build a Micro-Frontend Dashboard', durationMinutes: 90, resourceType: 'project', resourceUrl: 'https://github.com', isCompleted: false }
        ]
      },
      {
        _id: 'lp-seed-2',
        user: req.user._id,
        targetRole: 'Backend Architecture Specialist',
        skillGap: 'Docker, Kubernetes & Microservice Messaging',
        level: 'Advanced',
        progress: 30,
        status: 'in-progress',
        modules: [
          { _id: 'm5', title: 'Containerizing Node.js microservices', durationMinutes: 50, resourceType: 'video', resourceUrl: 'https://docker.com', isCompleted: true },
          { _id: 'm6', title: 'RabbitMQ & Kafka Event Streams', durationMinutes: 75, resourceType: 'interactive', resourceUrl: 'https://rabbitmq.com', isCompleted: false },
          { _id: 'm7', title: 'Kubernetes Ingress & Helm Charts', durationMinutes: 80, resourceType: 'project', resourceUrl: 'https://kubernetes.io', isCompleted: false }
        ]
      }
    ];
    return res.status(200).json({ success: true, count: seeded.length, data: seeded });
  }

  res.status(200).json({ success: true, count: paths.length, data: paths });
});

export const createLearningPath = catchAsync(async (req, res) => {
  const { targetRole, skillGap, level } = req.body;
  const sampleModules = [
    { title: `Core ${skillGap} Fundamentals`, durationMinutes: 45, resourceType: 'video', isCompleted: false },
    { title: `${skillGap} Advanced Patterns & Best Practices`, durationMinutes: 60, resourceType: 'article', isCompleted: false },
    { title: `Real-world Hands-on Project for ${targetRole}`, durationMinutes: 90, resourceType: 'project', isCompleted: false }
  ];

  const newPath = await LearningPath.create({
    user: req.user._id,
    targetRole: targetRole || 'Software Engineer',
    skillGap: skillGap || 'System Design',
    level: level || 'Intermediate',
    progress: 0,
    modules: sampleModules
  });

  res.status(201).json({ success: true, data: newPath });
});

export const toggleModuleStatus = catchAsync(async (req, res) => {
  const { id, moduleId } = req.params;
  const path = await LearningPath.findOne({ _id: id, user: req.user._id });
  
  if (!path) {
    // If seed item, return mock success
    return res.status(200).json({ success: true, message: 'Module updated (demo)' });
  }

  const mod = path.modules.id(moduleId);
  if (mod) {
    mod.isCompleted = !mod.isCompleted;
    const completedCount = path.modules.filter(m => m.isCompleted).length;
    path.progress = Math.round((completedCount / path.modules.length) * 100);
    await path.save();
  }

  res.status(200).json({ success: true, data: path });
});
