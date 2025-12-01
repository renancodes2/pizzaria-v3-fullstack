import { Injectable, InternalServerErrorException, BadRequestException, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GeoService {
  private readonly logger = new Logger(GeoService.name);
  private apiKey = process.env.GOOGLE_MAPS_API_KEY;

  private normalize(coordOrString: string | { lat: number; lng: number }) {
    if (typeof coordOrString === 'string') return coordOrString;
    if (
      typeof coordOrString === 'object' &&
      typeof coordOrString.lat === 'number' &&
      typeof coordOrString.lng === 'number'
    )
      return `${coordOrString.lat},${coordOrString.lng}`;

    throw new BadRequestException('Invalid coordinate format');
  }

  async getDistanceAndDuration(
    origin: string | { lat: number; lng: number },
    destination: string | { lat: number; lng: number },
  ) {
    const o = this.normalize(origin);
    const d = this.normalize(destination);
    const url = 'https://maps.googleapis.com/maps/api/distancematrix/json';

    try {
      const response = await axios.get(url, {
        params: {
          origins: o,
          destinations: d,
          key: this.apiKey,
        },
        timeout: 8000,
      });

      const result = response.data;
      const element = result.rows?.[0]?.elements?.[0];

      if (!element) {
        this.logger.warn('No elements returned from Google Maps', { origin: o, destination: d, result });
        throw new InternalServerErrorException('No result from Google Maps');
      }

      switch (element.status) {
        case 'OK':
          return {
            distanceText: element.distance?.text ?? null,
            distanceValue: element.distance?.value ?? null,
            durationText: element.duration?.text ?? null,
            durationValue: element.duration?.value ?? null,
          };
        case 'ZERO_RESULTS':
          return { distanceText: null, distanceValue: null, durationText: null, durationValue: null };
        default:
          this.logger.warn(`Google Maps returned status ${element.status}`, { origin: o, destination: d, result });
          throw new InternalServerErrorException('Error calculating distance via Google Maps');
      }
    } catch (err: any) {
      this.logger.error('Error calling Google Maps API', {
        message: err?.message,
        code: err?.code,
        status: err?.response?.status,
        data: err?.response?.data,
      });

      if (err?.code === 'ECONNABORTED') throw new InternalServerErrorException('Google Maps request timed out');
      if (err?.response?.status === 403 || err?.response?.status === 401)
        throw new InternalServerErrorException('Google Maps request denied');

      throw new InternalServerErrorException('Error accessing Google Maps API');
    }
  }
}