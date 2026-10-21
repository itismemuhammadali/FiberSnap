import React, { useState, useEffect } from 'react';
import { Image, ImageProps, ImageSourcePropType } from 'react-native';
import { ImageCacheService } from '../services/imageCache';

interface CachedImageProps extends Omit<ImageProps, 'source'> {
  source: ImageSourcePropType;
  fallback?: React.ReactNode;
}

export const CachedImage: React.FC<CachedImageProps> = ({ source, style, onError, fallback, ...rest }) => {
  // If source is a local require(..) number or array, pass directly
  const isRemoteOrFileUri =
    typeof source === 'object' && source !== null && !Array.isArray(source) && 'uri' in source && typeof source.uri === 'string';

  const rawUri = isRemoteOrFileUri ? (source as { uri: string }).uri : null;

  // Attempt instant synchronous lookup from memory index
  const initialUri = rawUri ? ImageCacheService.getCachedUriSync(rawUri) || (rawUri.startsWith('http') ? rawUri : null) : null;
  const [displayUri, setDisplayUri] = useState<string | null>(initialUri);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setHasError(false);

    if (!rawUri) {
      setDisplayUri(null);
      return;
    }

    // If synchronous lookup already found a valid local file on this device, we are done
    const syncUri = ImageCacheService.getCachedUriSync(rawUri);
    if (syncUri && syncUri.startsWith('file:')) {
      setDisplayUri(syncUri);
      return;
    }

    // Otherwise, asynchronously check disk cache or download once
    ImageCacheService.getCachedImageUri(rawUri)
      .then((cached) => {
        if (isMounted) {
          if (cached) {
            setDisplayUri(cached);
          } else if (rawUri.startsWith('http')) {
            setDisplayUri(rawUri);
          } else {
            setDisplayUri(null);
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          if (rawUri.startsWith('http')) {
            setDisplayUri(rawUri);
          } else {
            setDisplayUri(null);
          }
        }
      });

    return () => {
      isMounted = false;
    };
  }, [rawUri]);

  if (!isRemoteOrFileUri) {
    return <Image source={source} style={style} onError={onError} {...rest} />;
  }

  if (!displayUri || hasError) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <Image
      {...rest}
      source={{ ...(source as object), uri: displayUri }}
      style={style}
      onError={(e) => {
        setHasError(true);
        if (onError) onError(e);
      }}
    />
  );
};
