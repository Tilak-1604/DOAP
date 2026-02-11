package com.DOAP.service;

import com.DOAP.dto.AdminPlatformSummaryDTO;
import com.DOAP.entity.Booking;
import com.DOAP.entity.enums.BookingStatus;
import com.DOAP.entity.enums.ScreenStatus;
import com.DOAP.repository.*;
import com.opencsv.CSVWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.StringWriter;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminReportService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final ScreenRepository screenRepository;
    private final BookingRepository bookingRepository;
    private final ContentRepository contentRepository;

    public AdminPlatformSummaryDTO getPlatformSummary() {
        log.info("Generating platform summary report");
        try {
            return AdminPlatformSummaryDTO.builder()
                    .totalUsers(userRepository.count())
                    .totalAdvertisers(userRoleRepository.countByRole_RoleName("ADVERTISER"))
                    .totalScreenOwners(userRoleRepository.countByRole_RoleName("SCREEN_OWNER"))
                    .totalScreens(screenRepository.count())
                    .activeScreens(screenRepository.countByStatus(ScreenStatus.ACTIVE))
                    .pendingScreens(screenRepository.countByStatus(ScreenStatus.PENDING_APPROVAL))
                    .totalBookings(bookingRepository.count())
                    .totalRevenue(bookingRepository.calculateTotalRevenue() != null
                            ? bookingRepository.calculateTotalRevenue()
                            : 0.0)
                    .totalAds(contentRepository.countTotalAds())
                    .build();
        } catch (Exception e) {
            log.error("Error generating platform summary", e);
            throw e;
        }
    }

    public String generateBookingReport(LocalDateTime start, LocalDateTime end) {
        log.info("Generating booking report from {} to {}", start, end);
        StringWriter sw = new StringWriter();
        try (CSVWriter writer = new CSVWriter(sw)) {
            writer.writeNext(new String[] { "Booking ID", "Reference", "Advertiser ID", "Screen ID", "Content ID",
                    "Status", "Amount", "Created At" });

            List<Booking> bookings = bookingRepository.findAll();
            int count = 0;
            for (Booking b : bookings) {
                LocalDateTime createdAt = b.getCreatedAt();
                if (createdAt != null && !createdAt.isBefore(start) && !createdAt.isAfter(end)) {
                    writer.writeNext(new String[] {
                            String.valueOf(b.getId()),
                            b.getBookingReference() != null ? b.getBookingReference() : "N/A",
                            String.valueOf(b.getAdvertiserId()),
                            String.valueOf(b.getScreenId()),
                            String.valueOf(b.getContentId()),
                            String.valueOf(b.getStatus()),
                            String.valueOf(b.getPriceAmount() != null ? b.getPriceAmount() : 0.0),
                            createdAt.toString()
                    });
                    count++;
                }
            }
            log.info("Exported {} bookings to CSV", count);
        } catch (Exception e) {
            log.error("Error generating booking report", e);
        }
        return sw.toString();
    }

    public String generateRevenueReport(LocalDateTime start, LocalDateTime end) {
        log.info("Generating revenue report from {} to {}", start, end);
        StringWriter sw = new StringWriter();
        try (CSVWriter writer = new CSVWriter(sw)) {
            writer.writeNext(new String[] { "Booking ID", "Amount", "Confirmed At", "Status" });

            List<Booking> bookings = bookingRepository.findAll();
            int count = 0;
            for (Booking b : bookings) {
                if (b.getStatus() == BookingStatus.CONFIRMED && b.getConfirmedAt() != null) {
                    LocalDateTime confirmedAt = b.getConfirmedAt();
                    if (!confirmedAt.isBefore(start) && !confirmedAt.isAfter(end)) {
                        writer.writeNext(new String[] {
                                String.valueOf(b.getId()),
                                String.valueOf(b.getPriceAmount() != null ? b.getPriceAmount() : 0.0),
                                confirmedAt.toString(),
                                "PAID"
                        });
                        count++;
                    }
                }
            }
            log.info("Exported {} revenue records to CSV", count);
        } catch (Exception e) {
            log.error("Error generating revenue report", e);
        }
        return sw.toString();
    }
}
