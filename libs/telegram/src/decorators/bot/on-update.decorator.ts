import { SetMetadata } from '@nestjs/common';
import { ON_UPDATE_METADATA_KEY } from '@libs/telegram/constants';
import { UpdateTrigger } from '@libs/telegram/types';

const OnUpdate = (trigger: UpdateTrigger[] | UpdateTrigger) => {
  return SetMetadata(ON_UPDATE_METADATA_KEY, { trigger });
};

export default OnUpdate;
