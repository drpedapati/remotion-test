import { Composition } from 'remotion';
import { TTSTestAnimation } from './TTSTestAnimation';
import { HiggsTestAnimation } from './HiggsTestAnimation';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TTSTest"
        component={TTSTestAnimation}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="HiggsTest"
        component={HiggsTestAnimation}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
