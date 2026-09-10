import VideoPitch from '../models/VideoPitch.js';
import catchAsync from '../utils/catchAsync.js';

export const getVideoPitches = catchAsync(async (req, res) => {
  const pitches = await VideoPitch.find({ user: req.user._id }).sort({ createdAt: -1 });

  if (pitches.length === 0) {
    const seeded = [
      {
        _id: 'vp-seed-1',
        user: req.user._id,
        title: '60-sec Elevator Pitch: Senior Full-Stack Lead',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        durationSeconds: 58,
        transcript: "Hi! I'm a passionate full-stack engineer with 6+ years building scalable React & Node microservices. I specialize in real-time collaboration tools and high-velocity product delivery.",
        targetJobTitle: 'Lead Frontend Engineer @ Stripe',
        visibility: 'public',
        viewsCount: 142,
        likesCount: 28,
        tags: ['React', 'Node.js', 'System Architecture', 'Leadership'],
        createdAt: new Date().toISOString()
      },
      {
        _id: 'vp-seed-2',
        user: req.user._id,
        title: 'AI & Data Engineering Elevator Intro',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        durationSeconds: 45,
        transcript: "Hello recruiters! I focus on fine-tuning LLMs, building RAG pipelines, and integrating real-time AI vector indexing for search engines.",
        targetJobTitle: 'AI Integration Specialist @ Anthropic',
        visibility: 'public',
        viewsCount: 96,
        likesCount: 19,
        tags: ['Python', 'LangChain', 'VectorDB', 'OpenAI'],
        createdAt: new Date().toISOString()
      }
    ];
    return res.status(200).json({ success: true, count: seeded.length, data: seeded });
  }

  res.status(200).json({ success: true, count: pitches.length, data: pitches });
});

export const createVideoPitch = catchAsync(async (req, res) => {
  const { title, videoUrl, durationSeconds, transcript, targetJobTitle, tags } = req.body;
  const pitch = await VideoPitch.create({
    user: req.user._id,
    title: title || 'My Video Elevator Pitch',
    videoUrl: videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    durationSeconds: durationSeconds || 60,
    transcript: transcript || 'Hello! excited to present my background and passion for software innovation.',
    targetJobTitle: targetJobTitle || 'Software Engineer',
    tags: tags || ['Full-Stack', 'Engineering']
  });

  res.status(201).json({ success: true, data: pitch });
});

export const likeVideoPitch = catchAsync(async (req, res) => {
  const { id } = req.params;
  const pitch = await VideoPitch.findById(id);
  if (!pitch) {
    return res.status(200).json({ success: true, message: 'Liked pitch (demo)' });
  }
  pitch.likesCount += 1;
  await pitch.save();
  res.status(200).json({ success: true, data: pitch });
});
