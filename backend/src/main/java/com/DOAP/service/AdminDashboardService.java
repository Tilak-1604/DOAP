package com.DOAP.service;

import com.DOAP.dto.AdminDashboardStatsDTO;
import com.DOAP.entity.enums.BookingStatus;
import com.DOAP.entity.enums.ContentStatus;
import com.DOAP.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminDashboardService {

        private final UserRepository userRepository;
        private final UserRoleRepository userRoleRepository;
        private final ScreenRepository screenRepository;
        private final ContentRepository contentRepository;
        private final BookingRepository bookingRepository;
        private final OwnerEarningsRepository ownerEarningsRepository;

        public AdminDashboardStatsDTO getDashboardStats() {
                log.info("Fetching admin dashboard statistics");

                // User Statistics
                Long totalUsers = userRepository.count();
                Long totalAdvertisers = countUsersByRole("ADVERTISER");
                Long totalScreenOwners = countUsersByRole("SCREEN_OWNER");

                // Screen Statistics
                Long totalScreens = screenRepository.count();
                Long ownerScreens = screenRepository.countByOwnerRole("SCREEN_OWNER");
                Long doapScreens = screenRepository.countByOwnerRole("ADMIN");

                // Content Statistics
                Long totalAdsUploaded = contentRepository.countTotalAds();

                // Booking Statistics
                Long totalBookings = bookingRepository.count();
                Long heldBookings = bookingRepository.countByStatus(BookingStatus.HELD);
                Long confirmedBookings = bookingRepository.countByStatus(BookingStatus.CONFIRMED);

                // Revenue Statistics
                Double totalAdvertiserSpend = bookingRepository.calculateTotalRevenue();
                if (totalAdvertiserSpend == null)
                        totalAdvertiserSpend = 0.0;

                // Calculate commission revenue (sum of platformCommission from OwnerEarnings)
                Double commissionRevenue = ownerEarningsRepository.findAll().stream()
                                .mapToDouble(earning -> earning.getPlatformCommission() != null
                                                ? earning.getPlatformCommission()
                                                : 0.0)
                                .sum();

                // Calculate direct revenue from DOAP screens
                Double totalOwnerPayments = ownerEarningsRepository.findAll().stream()
                                .mapToDouble(earning -> earning.getOwnerAmount() != null ? earning.getOwnerAmount()
                                                : 0.0)
                                .sum();

                // Safe subtraction
                Double directRevenue = Math.max(0.0, totalAdvertiserSpend - totalOwnerPayments - commissionRevenue);
                Double totalDoapRevenue = commissionRevenue + directRevenue;

                log.info("Dashboard stats calculated: advertiserSpend={}, commission={}, direct={}, totalDoap={}",
                                totalAdvertiserSpend, commissionRevenue, directRevenue, totalDoapRevenue);

                return AdminDashboardStatsDTO.builder()
                                .totalUsers(totalUsers != null ? totalUsers : 0L)
                                .totalAdvertisers(totalAdvertisers != null ? totalAdvertisers : 0L)
                                .totalScreenOwners(totalScreenOwners != null ? totalScreenOwners : 0L)
                                .totalScreens(totalScreens != null ? totalScreens : 0L)
                                .ownerScreens(ownerScreens != null ? ownerScreens : 0L)
                                .doapScreens(doapScreens != null ? doapScreens : 0L)
                                .totalAdsUploaded(totalAdsUploaded != null ? totalAdsUploaded : 0L)
                                .totalBookings(totalBookings != null ? totalBookings : 0L)
                                .heldBookings(heldBookings != null ? heldBookings : 0L)
                                .confirmedBookings(confirmedBookings != null ? confirmedBookings : 0L)
                                .totalDoapRevenue(totalDoapRevenue)
                                .commissionRevenue(commissionRevenue)
                                .directRevenue(directRevenue)
                                .build();
        }

        private Long countUsersByRole(String roleName) {
                return userRoleRepository.findAll().stream()
                                .filter(ur -> ur.getRole().getRoleName().equals(roleName))
                                .count();
        }
}
