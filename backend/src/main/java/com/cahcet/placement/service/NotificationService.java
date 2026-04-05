package com.cahcet.placement.service;

import com.cahcet.placement.entity.*;
import com.cahcet.placement.repository.*;
import com.cahcet.placement.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public void notifyUser(User user, String title, String message, Notification.NotificationType type) {
        Notification notification = Notification.builder()
            .user(user).title(title).message(message).type(type).isRead(false).build();
        notificationRepository.save(notification);
    }

    public void notifyAllStudents(String title, String message, Notification.NotificationType type) {
        List<User> students = userRepository.findByRole(User.Role.STUDENT);
        students.forEach(student -> notifyUser(student, title, message, type));
    }

    public List<Notification> getMyNotifications() {
        UserDetailsImpl current = (UserDetailsImpl) SecurityContextHolder
            .getContext().getAuthentication().getPrincipal();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(current.getId());
    }

    public long getUnreadCount() {
        UserDetailsImpl current = (UserDetailsImpl) SecurityContextHolder
            .getContext().getAuthentication().getPrincipal();
        return notificationRepository.countByUserIdAndIsRead(current.getId(), false);
    }

    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    public void markAllAsRead() {
        UserDetailsImpl current = (UserDetailsImpl) SecurityContextHolder
            .getContext().getAuthentication().getPrincipal();
        List<Notification> unread = notificationRepository.findByUserIdAndIsRead(current.getId(), false);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}
