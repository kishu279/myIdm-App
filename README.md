# myIdm - Internet Download Manager for Android

A high-performance download manager built with React Native and Expo, featuring multi-connection downloads and intelligent chunk management.

## 🚀 Features

- **Multi-Connection Downloads**: Split files into multiple chunks for faster downloads (up to 16 connections)
- **Large File Support**: Download files up to 5GB with optimized memory management
- **Smart Chunk Splitting**: More connections = smaller chunks = better performance
- **Resume Support**: HTTP Range request support for resumable downloads
- **Memory Efficient**: Streams data directly to disk (1MB buffer blocks)
- **Progress Tracking**: Real-time progress updates with chunk-level monitoring
- **Public Downloads**: Automatically saves to Android Downloads folder
- **Dark/Light Theme**: Beautiful UI with theme support

## 📱 Demo

### Download APK
[Download myIdm APK](https://expo.dev/artifacts/eas/rihwkKxyd28zUQ3yhPEBqS.apk)

### Video Demo
[Watch Demo Video](https://drive.google.com/file/d/1opR7232tljl9qY4UbIZgnVQO-tZ6gW2E/view?usp=sharing)

## 🛠️ Technical Architecture

### Multi-Connection Download Flow

1. **Header Check**: Probes server with `Range: bytes=0-100` to detect partial content support
2. **Chunk Splitting**: Divides file into equal chunks based on connection count
3. **Concurrent Download**: Downloads 4 chunks simultaneously (batched to prevent OOM)
4. **Streaming Merge**: Merges chunks using 1MB memory blocks (no full file in RAM)
5. **Public Save**: Moves to `/storage/emulated/0/Download/`

### Memory Optimization

- **Streaming Downloads**: `File.downloadFileAsync()` writes directly to disk
- **Streaming Merge**: Reads/writes 1MB blocks, never loads full file
- **Batch Concurrency**: Max 4 simultaneous downloads to prevent memory exhaustion
- **Large Heap**: Android `largeHeap="true"` for 512MB+ heap on modern devices

### File Size Recommendations

| File Size | Recommended Connections | Memory Usage |
|-----------|------------------------|--------------|
| < 50MB    | 6-8 connections        | ~10MB        |
| 50-200MB  | 4-6 connections        | ~15MB        |
| 200MB-1GB | 4 connections          | ~20MB        |
| 1-3GB     | 2-4 connections        | ~25MB        |
| 3-5GB     | 2-3 connections        | ~30MB        |

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Android Studio (for Android builds)
- Expo CLI

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd myIdm

# Install dependencies
npm install

# Start development server
npx expo start

# Run on Android
npx expo run:android
```

## 🔧 Configuration

### Allowed Hosts

Edit `constants/app.ts` to whitelist download domains:

```typescript
export const ALLOWED_HOSTS: string[] = [
  'releases.ubuntu.com',
  'vikingfile.com',
  // Add your domains here
];
```

### Connection Limits

```typescript
export const MIN_CONNECTIONS = 1;
export const DEFAULT_CONNECTIONS = 4;
export const MAX_CONNECTIONS = 8;
export const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB
```

## 📂 Project Structure

```
myIdm/
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Main screen
├── components/            # React components
│   ├── Counter.tsx        # Connection counter
│   ├── DownloadProgress.tsx
│   ├── InputField.tsx
│   └── ConfirmButton.tsx
├── utils/                 # Core logic
│   ├── download-service.ts  # Multi-connection download engine
│   ├── confirm-handler.ts
│   └── validation.ts
├── constants/             # App constants
│   ├── app.ts
│   └── theme.ts
├── hooks/                 # Custom hooks
└── types/                 # TypeScript types
```

## 🧪 Key Technologies

- **React Native 0.81.5**: Cross-platform mobile framework
- **Expo SDK 54**: Development toolchain
- **expo-file-system/next**: Streaming file operations with FileHandle API
- **expo-media-library**: Public storage access
- **TypeScript**: Type-safe development

## 🐛 Troubleshooting

### OutOfMemoryError

- Reduce concurrent connections
- Ensure `android:largeHeap="true"` in AndroidManifest.xml
- Check available device storage (needs 2x file size)

### File Not Found After Download

- Check storage permissions are granted
- Look in `/storage/emulated/0/Download/` or Files app → Downloads
- Private files are in `/data/data/com.yourapp.myidm/files/downloads/`

### Server Returns 200 Instead of 206

- Server doesn't support Range requests
- App falls back to single-connection download
- Check server configuration for `Accept-Ranges: bytes`

## 📝 License

MIT License - feel free to use in your projects!

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a PR.

## 🌟 Acknowledgments

- Built with [Expo](https://expo.dev)
- Inspired by IDM and other download managers
